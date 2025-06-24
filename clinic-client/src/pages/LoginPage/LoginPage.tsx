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
  const { idToken, user: ctxUser, checkingCompany, needsSignup } = useAuth();

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
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Yükleniyor…</p>
      </div>
    );
  }

  const handleSocial = (provider: AuthProvider, name: "google" | "apple") => {
    setError("");
    setLoadingProvider(name);
    signInWithPopup(auth, provider)
      .catch((err) => setError(friendlyError(err.message)))
      .finally(() => setLoadingProvider(null));
  };

  const handleEmail = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingEmail(true);
    const fn =
      emailTab === "login"
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password);
    fn.catch((err) => setError(friendlyError(err.message))).finally(() =>
      setLoadingEmail(false)
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/* gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            background:
              "radial-gradient(circle at top, rgba(200,80,60,0.8) 0%,  white 100%)",
          }}
        />
      </div>

      {/* header */}
      <motion.div
        className="z-10 pt-12 pb-6 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="text-white text-4xl font-extrabold drop-shadow-lg mb-1">
          randevy
        </span>
        <span className="text-white/80 font-medium text-lg">Hoş geldiniz!</span>
      </motion.div>

      {/* main */}
      <div className="z-10 flex flex-col flex-1 justify-end items-center px-4 pb-6">
        <AnimatePresence>
          {error && (
            <motion.div
              className="w-full bg-red-100 text-red-700 text-sm rounded-lg px-4 py-2 mb-3 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex justify-center gap-6 mb-2"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {[
            {
              icon: <FaGoogle className="text-3xl" />,
              prov: googleProvider,
              name: "google",
            },
            {
              icon: <FaApple className="text-3xl" />,
              prov: appleProvider,
              name: "apple",
            },
          ].map((b) => (
            <motion.button
              key={b.name}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocial(b.prov, b.name as any)}
              disabled={!!loadingProvider}
              className="w-14 h-14 flex items-center justify-center bg-white border border-gray-200 shadow-md hover:shadow-lg active:shadow-sm rounded-2xl"
            >
              {loadingProvider === b.name ? (
                <FaSpinner className="animate-spin text-3xl text-gray-500" />
              ) : (
                b.icon
              )}
            </motion.button>
          ))}
        </motion.div>

        <p className="text-center text-sm text-gray-600 mb-6">
          Google veya Apple butonlarına tıklayarak hem giriş yapabilir hem de
          hesap oluşturabilirsiniz.
        </p>

        <div className="flex items-center w-full mb-4">
          <hr className="flex-grow border-t border-gray-200" />
        </div>

        <AnimatePresence>
          {!showEmailForm ? (
            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shadow-lg mb-4"
              onClick={() => setShowEmailForm(true)}
            >
              <FaChevronDown className="text-gray-600 text-xl" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mb-4"
            >
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={() => setEmailTab("login")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    emailTab === "login"
                      ? "bg-[#e2725b] text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  onClick={() => setEmailTab("signup")}
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    emailTab === "signup"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  Kayıt Ol
                </button>
              </div>

              <form onSubmit={handleEmail} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loadingEmail}
                  className="rounded-xl px-4 py-3 bg-white/80 border border-gray-300 focus:ring-2 focus:ring-[#e2725b]"
                  required
                />
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Şifre"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loadingEmail}
                    className="w-full rounded-xl px-4 py-3 bg-white/80 border border-gray-300 focus:ring-2 focus:ring-[#e2725b]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    tabIndex={-1}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loadingEmail}
                  className={`w-full py-3 rounded-full font-semibold text-white ${
                    emailTab === "login" ? "bg-[#e2725b]" : "bg-green-600"
                  }`}
                >
                  {loadingEmail
                    ? "Yükleniyor…"
                    : emailTab === "login"
                    ? "Giriş Yap"
                    : "Kayıt Ol"}
                </button>
              </form>
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => setShowEmailForm(false)}
                  className="text-xs text-gray-400 underline"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
