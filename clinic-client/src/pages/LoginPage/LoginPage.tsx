import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  AuthProvider,
} from "firebase/auth";
import { auth, googleProvider, appleProvider } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaGoogle,
  FaApple,
  FaChevronDown,
  FaEye,
  FaEyeSlash,
  FaSpinner,
} from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

const friendlyError = (msg: string) => {
  if (msg.includes("user-not-found")) return "Kullanıcı bulunamadı.";
  if (msg.includes("wrong-password")) return "Şifre hatalı.";
  if (msg.includes("email-already-in-use")) return "Bu email zaten kayıtlı.";
  if (msg.includes("too-many-requests"))
    return "Çok fazla deneme. Lütfen bekleyin.";
  return msg;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    idToken,
    user: ctxUser,
    checkingCompany,
    needsSignup,
    refreshUserContext,
  } = useAuth();

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailTab, setEmailTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [loadingProvider, setLoadingProvider] = useState<
    "google" | "apple" | null
  >(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (needsSignup) {
      navigate("/signup", { replace: true });
    }
    if (!checkingCompany && idToken && ctxUser) {
      navigate("/onboarding", { replace: true });
    }
  }, [needsSignup, checkingCompany, idToken, ctxUser, navigate]);

  if (checkingCompany) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#ffe1da] via-[#fdf3ef] to-[#fff7f4]">
        <p className="text-gray-500 text-lg font-medium">Yükleniyor…</p>
      </div>
    );
  }

  // --- SOCIAL LOGIN ---
  const handleSocial = async (
    provider: AuthProvider,
    name: "google" | "apple"
  ) => {
    setError("");
    setLoadingProvider(name);
    try {
      await signInWithPopup(auth, provider);
      await refreshUserContext();
    } catch (err: any) {
      setError(friendlyError(err.message || err.code || "Giriş yapılamadı."));
    } finally {
      setLoadingProvider(null);
    }
  };

  // --- EMAIL LOGIN/SIGNUP ---
  const handleEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingEmail(true);
    try {
      if (emailTab === "login") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      await refreshUserContext();
    } catch (err: any) {
      setError(friendlyError(err.message || err.code || "Giriş yapılamadı."));
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col w-full relative"
      style={{
        background:
          "linear-gradient(135deg, #ffe1da 0%, #fdf3ef 45%, #fff7f4 100%)",
      }}
    >
      {/* HEADER */}
      <div className="w-full flex flex-col items-center pt-10 pb-3 z-[100] relative">
        <div className="flex items-center gap-3 mb-2 ">
          <img
            src="/randevi-small.png"
            alt="randevi logo"
            className="h-12 rounded-lg  "
          />
        </div>
        <h2 className="text-2xl font-bold text-black mb-1">Hoş geldiniz!</h2>
        <p className="text-base font-medium text-gray-500 mb-2">
          <span className="text-[#e2725b] font-bold">Randevi</span>
          <span className="ml-1">'ye giriş yapın</span>
        </p>
      </div>

      {/* FOOTER */}
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-gray-400 pointer-events-none select-none z-0">
        © {new Date().getFullYear()} randevi
      </div>

      {/* BOTTOM ACTIONS */}
      <div className="w-full flex flex-col items-center absolute left-0 right-0 bottom-9 z-10">
        {/* ERROR */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="w-full max-w-[380px] bg-red-100 text-red-700 font-semibold text-base rounded-lg px-5 py-2 mb-4 text-center shadow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SOCIAL BUTTONS */}
        <div className="flex flex-col gap-3 w-full max-w-[380px] mb-3 px-2">
          <button
            onClick={() => handleSocial(googleProvider, "google")}
            disabled={!!loadingProvider}
            className={`
              flex items-center justify-center w-full rounded-xl bg-white shadow-lg mb-1 py-4 text-lg font-semibold border border-gray-200
              ${
                loadingProvider === "google"
                  ? "opacity-60"
                  : "hover:bg-gray-50 transition"
              }
            `}
          >
            {loadingProvider === "google" ? (
              <FaSpinner className="animate-spin text-2xl mr-2" />
            ) : (
              <FaGoogle className="text-2xl mr-2" />
            )}
            Google ile Devam Et
          </button>
          <button
            onClick={() => handleSocial(appleProvider, "apple")}
            disabled={!!loadingProvider}
            className={`
              flex items-center justify-center w-full rounded-xl bg-white shadow-lg py-4 text-lg font-semibold border border-gray-200
              ${
                loadingProvider === "apple"
                  ? "opacity-60"
                  : "hover:bg-gray-50 transition"
              }
            `}
          >
            {loadingProvider === "apple" ? (
              <FaSpinner className="animate-spin text-2xl mr-2" />
            ) : (
              <FaApple className="text-2xl mr-2" />
            )}
            Apple ile Devam Et
          </button>
        </div>
        <div className="text-center text-sm text-gray-600 mb-2 w-full max-w-[380px]">
          Google veya Apple ile hızlı giriş/kayıt olabilirsiniz.
        </div>
        <div className="flex items-center w-full max-w-[320px] my-2 mb-3">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">veya</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        {/* EMAIL SLIDER BUTTON */}
        {!showEmailForm && (
          <button
            className="flex items-center justify-center w-full max-w-[360px] rounded-full bg-white shadow-xl py-4 text-lg font-semibold border border-[#e2725b] text-[#e2725b] hover:bg-[#ffe1da] transition mb-3"
            onClick={() => setShowEmailForm(true)}
          >
            <FaChevronDown className="text-[#e2725b] text-xl mr-2" />
            Email ile giriş/kayıt
          </button>
        )}
      </div>

      {/* SLIDING EMAIL PANEL */}
      <AnimatePresence>
        {showEmailForm && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center items-end"
          >
            {/* Overlay: blurred, semi-transparent, but does NOT cover the logo/header */}
            <div
              className="fixed inset-0 bg-white/40 backdrop-blur-[7px] z-40"
              onClick={() => setShowEmailForm(false)}
              aria-label="Kapat"
            />

            {/* The sliding panel: higher z-index than overlay */}
            <motion.div
              className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl shadow-2xl pb-8 px-5 pt-6 flex flex-col z-50"
              initial={{ y: 60, opacity: 0.7 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
            >
              {/* Close */}
              <button
                className="absolute left-4 top-4 text-gray-400 hover:text-brand-main p-2"
                onClick={() => setShowEmailForm(false)}
                aria-label="Kapat"
                tabIndex={1}
              ></button>
              {/* Tabs */}
              <div className="flex justify-center gap-2 mb-5 mt-1">
                <button
                  type="button"
                  onClick={() => setEmailTab("login")}
                  className={`flex-1 px-2 py-2 rounded-l-full text-sm font-bold transition 
                    ${
                      emailTab === "login"
                        ? "bg-brand-main text-white shadow"
                        : "bg-gray-100 text-brand-main/80 border border-brand-main/30"
                    }`}
                  style={{ outline: "none" }}
                  aria-pressed={emailTab === "login"}
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => setEmailTab("signup")}
                  className={`flex-1 px-2 py-2 rounded-r-full text-sm font-bold transition
                    ${
                      emailTab === "signup"
                        ? "bg-green-600 text-white shadow"
                        : "bg-gray-100 text-green-600/80 border border-green-600/30"
                    }`}
                  style={{ outline: "none" }}
                  aria-pressed={emailTab === "signup"}
                >
                  Kayıt Ol
                </button>
              </div>
              {/* FORM */}
              <form onSubmit={handleEmail} className="flex flex-col gap-4 mt-2">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingEmail}
                  className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-brand-main w-full shadow-sm text-base"
                  required
                />
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Şifre"
                    value={password}
                    autoComplete={
                      emailTab === "login" ? "current-password" : "new-password"
                    }
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loadingEmail}
                    className="rounded-xl px-4 py-3 bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-brand-main w-full shadow-sm text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-main transition"
                    tabIndex={-1}
                    aria-label={showPass ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loadingEmail}
                  className={`
                    w-full py-3 rounded-full font-bold shadow-md text-base
                    ${
                      emailTab === "login"
                        ? "bg-brand-main hover:bg-brand-main/80"
                        : "bg-green-600 hover:bg-green-700"
                    }
                    text-white flex items-center justify-center
                    disabled:opacity-60
                  `}
                >
                  {loadingEmail && <FaSpinner className="animate-spin mr-2" />}
                  {emailTab === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
