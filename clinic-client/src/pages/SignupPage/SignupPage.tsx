import { useEffect, useState, useMemo, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { auth } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { registerUser } from "../../api/userApi";
import {
  FaChevronLeft,
  FaChevronRight,
  FaThLarge,
  FaSpinner,
} from "react-icons/fa";
import doodles from "../../data/doodles.json";

const MAIN_BG =
  "linear-gradient(135deg, #ffe1da 0%, #fdf3ef 45%, #fff7f4 100%)";
const BRAND_MAIN = "#e2725b";
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

// Utility to merge user photo at first position if present
function getAvatarOptions(
  userPhoto: string | null,
  doodles: string[]
): string[] {
  if (userPhoto && !doodles.includes(userPhoto)) {
    return [userPhoto, ...doodles];
  }
  return doodles;
}

export default function SignupPage() {
  const { idToken, needsSignup, signOut, refreshUserContext } = useAuth();
  const navigate = useNavigate();
  const fbUser = auth.currentUser;

  const userPhoto: string | null = fbUser?.photoURL || null;

  // Ensure the user photo is first and not duplicated
  const avatars: string[] = useMemo(
    () => getAvatarOptions(userPhoto, doodles),
    [userPhoto]
  );

  // Safe index management
  const [selectedIdx, setSelectedIdx] = useState<number>(
    userPhoto ? 0 : Math.floor(avatars.length / 2)
  );

  useEffect(() => {
    // Whenever avatars change, clamp selectedIdx
    if (selectedIdx > avatars.length - 1) setSelectedIdx(avatars.length - 1);
    if (selectedIdx < 0) setSelectedIdx(0);
    // If user photo appears, go to index 0
    if (userPhoto) setSelectedIdx(0);
  }, [avatars.length, userPhoto]);

  const [bgColor, setBgColor] = useState<string>("FFFFFF");
  const [showAll, setShowAll] = useState<boolean>(false);

  // Redirect if not needed
  useEffect(() => {
    if (!needsSignup) navigate("/login", { replace: true });
  }, [needsSignup, navigate]);

  // Form state
  const [name, setName] = useState<string>(fbUser?.displayName ?? "");
  const [email] = useState<string>(fbUser?.email ?? "");
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  function withBg(url: string, i: number): string {
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
    registerUser(idToken, {
      name,
      email,
      photoUrl: withBg(avatars[selectedIdx], selectedIdx),
    })
      .then(async () => {
        await refreshUserContext();
        navigate("/onboarding", { replace: true });
      })
      .catch((err: any) => {
        setError(err.message ?? "Hesap oluşturulamadı.");
        setCreating(false);
      });
  }

  // 3D carousel transform (unchanged, but z-index enforced)
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
        top: "52%",
        marginLeft: -((selected ? 100 : 70) / 2),
        marginTop: -((selected ? 100 : 70) / 2),
        transition: "all 0.22s cubic-bezier(.5,1.7,.67,1)",
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: selected ? "0 2px 12px 0 #e2725b20" : "0 2px 8px 0 #0001",
        // pointerEvents: selected ? "auto" : "none", // Removed for TS
      } as React.CSSProperties,
    };
  }

  // Avatar selection modal
  const AllModal = () => (
    <AnimatePresence>
      {showAll && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
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
              {avatars.map((u: string, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedIdx(i);
                    setShowAll(false);
                  }}
                  className={`p-1 rounded-full border-2 transition ${
                    i === selectedIdx
                      ? "border-[#e2725b] scale-110"
                      : "border-white"
                  }`}
                  style={{ background: "#f3f3f3" }}
                >
                  <img
                    src={withBg(u, i)}
                    className="w-10 h-10 object-cover rounded-full"
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
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        background: MAIN_BG,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* HEADER */}
      <div className="w-full flex flex-col items-center pt-10 pb-3 z-[100] relative">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/randevi-small.png"
            alt="randevi logo"
            className="h-12 rounded-lg "
          />
        </div>
        <h2 className="text-2xl font-bold text-black mb-1">Hesap Oluştur</h2>
        <p className="text-base font-medium text-gray-500 mb-2">
          <span className="text-[#e2725b] font-bold">Randevi</span>
          <span className="ml-1">'ye kayıt olun</span>
        </p>
      </div>

      {/* AVATAR PICKER CAROUSEL */}
      <div className="flex flex-col items-center mb-3 mt-2 w-full">
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
            tabIndex={0}
            onClick={() => setSelectedIdx((idx) => Math.max(0, idx - 1))}
            disabled={selectedIdx === 0}
            style={{
              position: "absolute",
              left: "12%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.95)",
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px 0 #0001",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: selectedIdx === 0 ? "not-allowed" : "pointer",
              opacity: selectedIdx === 0 ? 0.5 : 1,
              transition: "opacity 0.18s",
            }}
          >
            <FaChevronLeft className="text-xl text-gray-600" />
          </button>

          {/* Right arrow */}
          <button
            type="button"
            tabIndex={0}
            onClick={() =>
              setSelectedIdx((idx) => Math.min(avatars.length - 1, idx + 1))
            }
            disabled={selectedIdx === avatars.length - 1}
            style={{
              position: "absolute",
              right: "12%",
              top: "50%",
              transform: "translate(50%, -50%)",
              zIndex: 1000,
              width: 48,
              height: 48,
              background: "rgba(255,255,255,0.95)",
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px 0 #0001",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor:
                selectedIdx === avatars.length - 1 ? "not-allowed" : "pointer",
              opacity: selectedIdx === avatars.length - 1 ? 0.5 : 1,
              transition: "opacity 0.18s",
            }}
          >
            <FaChevronRight className="text-xl text-gray-600" />
          </button>

          {/* Avatars carousel */}
          <div className="relative w-full h-full">
            {avatars.map((url: string, i: number) => {
              const { visible, style } = getCarouselTransforms(i, selectedIdx);
              if (!visible) return null;
              return (
                <motion.div key={i} style={style as React.CSSProperties}>
                  <img
                    src={withBg(url, i)}
                    alt=""
                    className="w-full h-full object-cover"
                    draggable={false}
                    style={{ userSelect: "none" }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
        {/* Color picker */}
        <div className="flex gap-2 mt-1 mb-2">
          {COLOR_OPTIONS.map((c: string) => (
            <button
              key={c}
              onClick={() => selectedIdx !== 0 && setBgColor(c)}
              disabled={selectedIdx === 0}
              className={`w-6 h-6 rounded-full border-2 transition ${
                bgColor === c ? "border-[#e2725b] scale-110" : "border-white"
              } ${selectedIdx === 0 ? "opacity-50" : ""}`}
              style={{ backgroundColor: `#${c}` }}
            />
          ))}
        </div>
        <button
          onClick={() => setShowAll(true)}
          className="mt-1 text-xs text-[#e2725b] bg-white/80 px-3 py-1 rounded-full border border-gray-200 shadow hover:bg-white transition flex items-center gap-1"
        >
          <FaThLarge className="inline" /> Tümünü Gör
        </button>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs flex flex-col gap-3 px-3"
      >
        <AnimatePresence>
          {error && (
            <motion.div
              className="mb-1 text-red-600 bg-red-100 rounded-lg py-2 px-3 text-sm text-center"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            İsim
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Adınız"
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-base font-medium placeholder:text-gray-400 shadow"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-base font-medium opacity-70"
          />
        </div>
        <label className="flex items-center text-xs text-gray-700 gap-2 mb-1">
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
          className="w-full py-3 rounded-full text-white text-base font-bold"
          style={{
            background: BRAND_MAIN,
            transition: "all 0.2s",
            opacity: !acceptTerms || creating ? 0.7 : 1,
          }}
        >
          {creating && <FaSpinner className="animate-spin mr-2 inline" />}{" "}
          Oluştur
        </button>
      </form>

      {/* Geri dön */}
      <button
        onClick={() => {
          signOut();
          navigate("/login", { replace: true });
        }}
        className="mt-6 text-sm text-[#e2725b] underline flex items-center gap-1"
      >
        <FaChevronLeft /> Geri Dön
      </button>

      {/* Footer */}
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-gray-400 pointer-events-none select-none z-0">
        © {new Date().getFullYear()} randevi
      </div>

      <AllModal />
    </div>
  );
}
