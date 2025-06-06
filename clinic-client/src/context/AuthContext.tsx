// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  uid: string;
  email: string;
  name: string;
  imageUrl: string;
}

interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  clinicId: string | null;
  clinicName: string | null;
  checkingClinic: boolean;
  setClinicId: (id: string) => void;
  setClinicName: (name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
const API_BASE = import.meta.env.VITE_RAILWAY_LINK || "http://localhost:3001"; // Use VITE_API_BASE from .env or fallback to localhost

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string | null>(null);
  const [checkingClinic, setCheckingClinic] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        // Logged out
        setIdToken(null);
        setUser(null);
        setClinicId(null);
        setClinicName(null);
        setCheckingClinic(false);
        return;
      }

      try {
        // 1) get the fresh token
        const token = await fbUser.getIdToken();
        setIdToken(token);

        // 2) set user info
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          imageUrl: fbUser.photoURL || "",
        });

        // 3) now fetch the clinic
        setCheckingClinic(true);
        const res = await fetch(`${API_BASE}/clinic/by-email`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setClinicId(data._id);
          setClinicName(data.name);
        } else if (res.status === 404) {
          setClinicId(null);
          setClinicName(null);
        } else {
          console.error("Unexpected error fetching clinic:", await res.text());
          setClinicId(null);
          setClinicName(null);
        }
      } catch (err) {
        console.error("Network or token error:", err);
        setClinicId(null);
        setClinicName(null);
      } finally {
        setCheckingClinic(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOutUser = () => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setClinicId(null);
    setClinicName(null);
    setCheckingClinic(false);
  };

  return (
    <AuthContext.Provider
      value={{
        idToken,
        user,
        clinicId,
        clinicName,
        checkingClinic,
        setClinicId,
        setClinicName,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthContextProvider");
  }
  return ctx;
}
