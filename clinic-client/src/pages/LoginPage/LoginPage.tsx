// src/LoginPage.tsx
import React, { useState, FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase";

// React Icons for social buttons and password toggle
import {
  FaGoogle,
  FaApple,
  FaPhone,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password sign-in
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will pick up the new user
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Bir hata oluştu.");
    }
  };

  // Email/Password sign-up
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will pick up the new user
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Bir hata oluştu.");
    }
  };

  // Google sign-in
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will pick up the new user
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Google ile giriş başarısız.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* Top: Gradient background with logo */}
      <div className="absolute inset-0 h-1/2 bg-[radial-gradient(circle_at_top,_rgba(0,200,150,0.6)_0%,_rgba(120,100,255,0.3)_50%,_white_90%)] z-0" />

      {/* Logo stays near the top */}
      <div className="relative mt-6 z-10 flex items-end justify-center h-1/2 pb-6">
        <span className="text-xl font-semibold text-white drop-shadow-md">
          clinica
        </span>
      </div>

      {/* Everything else: pushed to bottom */}
      <div className="relative z-10 mt-auto px-6 pb-6">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">
          Welcome Back!
        </h1>

        {errorMsg && (
          <div className="mt-4 text-center text-sm text-red-600">
            {errorMsg}
          </div>
        )}

        {/* Social buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          {[FaGoogle, FaApple, FaPhone, FaUser].map((Icon, i) => (
            <button
              key={i}
              onClick={i === 0 ? handleGoogleSignIn : () => {}}
              className="w-12 h-12 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100"
            >
              <Icon className="w-5 h-5 text-gray-700" />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <hr className="flex-grow border-t border-gray-200" />
        </div>

        {/* Email + Password */}
        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Forgot + Sign In */}
          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              className="text-gray-600 hover:underline"
              onClick={() => {}}
            >
              Forgot Password?
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-green-300 hover:bg-brand-green-500 text-white font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-200 transition-colors duration-200 drop-shadow-md"
            >
              Sign In
            </button>
          </div>
        </form>

        {/* Sign Up */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            onClick={handleSignUp}
            className="text-brand-gray-400 hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
