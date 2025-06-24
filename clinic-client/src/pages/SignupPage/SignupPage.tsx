import { useEffect, useState, useMemo, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { createUser } from "../../api/userApi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaThLarge,
  FaChevronUp,
  FaSpinner,
} from "react-icons/fa";
import doodles from "../../data/doodles.json";

const MAIN_BG = "radial-gradient(circle at top, #e2725b 0%, #f8b7a1 100%)";
const COLOR_OPTIONS = [
  "FFFFFF",
  "F28AB2",
  "FF6B6B",
  "FFD93D",
  "5D8AA8",
  "4ECDC4",
  "00B894",
  "6366F1",
  "E17055",
];

function getAvatarOptions(userPhoto?: string | null) {
  return userPhoto ? [userPhoto, ...doodles] : [...doodles];
}

export default function SignupPage() {
  const { idToken, needsSignup, signOut } = useAuth();
  const navigate = useNavigate();
  const fbUser = auth.currentUser;

  const userPhoto = fbUser?.photoURL || null;
  const avatars = useMemo(() => getAvatarOptions(userPhoto), [userPhoto]);
  const initialIdx = userPhoto ? 0 : Math.floor(avatars.length / 2);

  const [selectedIdx, setSelectedIdx] = useState(initialIdx);
  const [bgColor, setBgColor] = useState("FFFFFF");
  const [showAll, setShowAll] = useState(false);

  // Redirect effect (only on needsSignup)
  useEffect(() => {
    if (!needsSignup) {
      navigate("/login", { replace: true });
    }
  }, [needsSignup, navigate]);

  // Recentering effect (only when userPhoto changes)
  useEffect(() => {
    if (userPhoto) {
      setSelectedIdx(0);
    }
  }, [userPhoto]);

  // Form state
  const [name, setName] = useState(fbUser?.displayName || "");
  const [email] = useState(fbUser?.email || "");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  function withBg(url: string, i: number) {
    if (userPhoto && i === 0) return url;
    if (url.includes("doodleipsum.com") && /bg=/.test(url)) {
      return url.replace(/bg=[^&]*/, `bg=${bgColor}`);
    }
    return url;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!idToken || !acceptTerms) return;
    setError("");
    setCreating(true);
    createUser(idToken, {
      name,
      email,
      photoUrl: withBg(avatars[selectedIdx], selectedIdx),
    })
      .then(() => window.location.reload())
      .catch((err) => {
        setError(err.message || "Hesap oluşturulamadı.");
        setCreating(false);
      });
  }

  // 3D revolver carousel transforms
  function getCarouselTransforms(i: number, center: number) {
    const maxOffset = 3;
    const offset = i - center;
    if (Math.abs(offset) > maxOffset) return { visible: false };
    const selected = offset === 0;

    return {
      visible: true,
      style: {
        transform: `
          translateX(${offset * 48}px)
          scale(${selected ? 1 : 0.8 - Math.abs(offset) * 0.08})
          perspective(500px)
          rotateY(${offset * -20}deg)
        `,
        zIndex: 10 - Math.abs(offset),
        borderColor: selected ? "#e2725b" : "#fff",
        borderWidth: selected ? 3 : 1,
        width: selected ? 100 : 70,
        height: selected ? 100 : 70,
        opacity: 1 - Math.abs(offset) * 0.25,
        filter: selected ? "none" : "blur(1px) grayscale(40%)",
        background: "#fff",
        position: "absolute" as const,
        left: "50%",
        top: "55%",
        marginLeft: -((selected ? 100 : 70) / 2),
        marginTop: -((selected ? 100 : 70) / 2),
        transition: "all 0.22s cubic-bezier(.5,1.7,.67,1)",
        borderRadius: "50%",
        overflow: "hidden",
      },
    };
  }

  const AllModal = () => (
    <AnimatePresence>
      {showAll && (
        // backdrop
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* popup panel with slide-down spring */}
          <motion.div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full"
            initial={{ y: -50, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 500, damping: 25 },
            }}
            exit={{
              y: -50,
              opacity: 0,
              transition: { type: "spring", stiffness: 500, damping: 25 },
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-base">Profil Seçenekleri</h2>
              <button
                onClick={() => setShowAll(false)}
                className="text-xs text-gray-600"
              >
                Kapat
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((u, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedIdx(i);
                    setShowAll(false);
                  }}
                  className={`p-2 rounded-full border-2 transition ${
                    i === selectedIdx
                      ? "border-[#e2725b] scale-110"
                      : "border-white"
                  }`}
                  style={{ background: "#f3f3f3" }}
                >
                  <img
                    src={withBg(u, i)}
                    className="w-12 h-12 object-cover rounded-full"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ background: MAIN_BG, fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <motion.div
        className="pt-12 pb-5 text-center flex-none"
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="text-3xl font-extrabold text-white drop-shadow tracking-tight mb-1">
          randevy
        </h1>
        <p className="text-white/90 text-lg font-semibold tracking-wide">
          Hesap Oluştur
        </p>
      </motion.div>

      {/* Bottom content */}
      <div className="flex-1 w-full flex flex-col justify-end items-center pb-6">
        {/* Carousel */}
        <div
          className="relative w-full h-44 mb-2"
          style={{
            maxWidth: 400,
            margin: "0 auto",
            perspective: 800,
            overflow: "visible",
          }}
        >
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => setSelectedIdx((p) => Math.max(p - 1, 0))}
            disabled={selectedIdx === 0}
            style={{
              position: "absolute",
              left: "18%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaChevronLeft className="text-xl text-gray-600" />
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() =>
              setSelectedIdx((p) => Math.min(p + 1, avatars.length - 1))
            }
            disabled={selectedIdx === avatars.length - 1}
            style={{
              position: "absolute",
              right: "18%",
              top: "50%",
              transform: "translate(50%, -50%)",
              zIndex: 1000,
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaChevronRight className="text-xl text-gray-600" />
          </button>

          {/* Avatars */}
          <div className="relative w-full h-full">
            {avatars.map((url, i) => {
              const { visible, style } = getCarouselTransforms(i, selectedIdx);
              if (!visible) return null;
              return (
                <motion.div key={i} style={style}>
                  <img
                    src={withBg(url, i)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Always-on Color Picker */}
        <div className="flex items-center gap-1 mb-3 justify-center">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              onClick={() => selectedIdx !== 0 && setBgColor(c)}
              disabled={selectedIdx === 0}
              className={`w-6 h-6 rounded-full border-2 transition ${
                bgColor === c ? "border-[#e2725b] scale-110" : "border-white"
              } ${selectedIdx === 0 ? "opacity-50" : ""}`}
              style={{
                backgroundColor: `#${c}`,
              }}
            />
          ))}
        </div>

        {/* See All */}
        <button
          onClick={() => setShowAll(true)}
          className="mb-4 flex items-center gap-1 text-xs text-[#e2725b] bg-white/30 px-3 py-1 rounded-full border border-white/50 shadow hover:bg-white/50 transition"
        >
          <FaThLarge /> Tümünü Gör
        </button>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[340px] flex flex-col gap-3 px-3"
        >
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-1 text-red-100 bg-red-600/80 rounded-lg py-2 px-3 text-sm text-center"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">
              İsim
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Adınız"
              className="w-full px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-[#e2725b] bg-white/95 border-0 text-base font-medium placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2.5 rounded-xl bg-gray-100/90 border-0 text-base font-medium opacity-70"
            />
          </div>

          <label className="flex items-center text-xs text-white/90 gap-2 mb-1">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms((v) => !v)}
              className="accent-[#e2725b] w-4 h-4"
              required
            />
            <span>
              <a
                href="/terms"
                target="_blank"
                className="underline font-semibold"
              >
                Kullanım Koşullarını
              </a>{" "}
              kabul ediyorum
            </span>
          </label>

          <button
            type="submit"
            disabled={!acceptTerms || creating}
            className="w-full py-3 rounded-full text-white text-base font-bold bg-[#e2725b] hover:bg-[#e15a39] flex justify-center items-center disabled:opacity-70 transition-all"
          >
            {creating && <FaSpinner className="animate-spin mr-2" />} Oluştur
          </button>
        </form>

        {/* Back / Sign Out */}
        <motion.button
          onClick={() => {
            signOut();
            navigate("/login", { replace: true });
          }}
          className="mt-3 flex items-center text-white/90 text-sm gap-1 underline"
          whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
        >
          <FaChevronUp /> Geri Dön
        </motion.button>
      </div>

      <AllModal />
    </div>
  );
}
