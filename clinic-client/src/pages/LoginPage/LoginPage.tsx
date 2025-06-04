// src/LoginPage.tsx
import React, { useState, FormEvent } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Email/Password sign‐in
  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.tsx will pick this up
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Bir hata oluştu.");
      }
    }
  };

  // Email/Password sign‐up
  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged in App.tsx will pick this up
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Bir hata oluştu.");
      }
    }
  };

  // Google sign‐in
  const handleGoogleSignIn = async () => {
    setErrorMsg("");
    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged in App.tsx will pick this up
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Bir hata oluştu.");
      }
    }
  };

  return (
    <div className="login‐page‐wrapper">
      <div className="login‐card">
        <h1 className="login‐heading">Hoş Geldiniz</h1>
        <p className="login‐subheading">Devam etmek için lütfen oturum açın</p>

        <form onSubmit={handleSignIn} className="login‐form">
          <label className="login‐label" htmlFor="email-input">
            Email
          </label>
          <input
            id="email-input"
            type="email"
            className="login‐input"
            placeholder="örnek@e-posta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login‐label" htmlFor="password-input">
            Şifre
          </label>
          <input
            id="password-input"
            type="password"
            className="login‐input"
            placeholder="Şifrenizi girin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && <div className="login‐error">{errorMsg}</div>}

          <button type="submit" className="btn‐primary">
            Giriş Yap
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            className="btn‐secondary"
          >
            Kayıt Ol
          </button>
        </form>

        <div className="divider">
          <span>YA DA</span>
        </div>

        <button onClick={handleGoogleSignIn} className="btn‐google">
          Google ile Giriş Yap
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
