// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { auth } from "../firebase"; // ← your firebase.ts should export 'auth'
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

interface User {
  uid: string;
  email: string;
  name: string;
  imageUrl: string;
}

// We’ll store both clinicId and clinicName in context:
interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  clinicId: string | null;
  clinicName: string | null;
  checkingClinic: boolean; // true while we’re doing GET /clinic/by-email
  setClinicId: (id: string) => void; // so CreateClinicPage can set it after creation
  setClinicName: (name: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string | null>(null);
  const [checkingClinic, setCheckingClinic] = useState<boolean>(false);

  useEffect(() => {
    // 1) Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // a) We have a logged‐in Firebase user
          const token = await fbUser.getIdToken();
          setIdToken(token);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email || "",
            name: fbUser.displayName || "",
            imageUrl: fbUser.photoURL || "",
          });

          // b) Immediately fetch this user’s clinic from our backend:
          setCheckingClinic(true);
          try {
            const res = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/clinic/by-email`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (res.ok) {
              const data = await res.json();
              // We assume backend returns { _id, name, ownerEmail, workers, … }
              setClinicId(data._id);
              setClinicName(data.name);
            } else if (res.status === 404) {
              // No clinic found → leave clinicId & clinicName as null
              setClinicId(null);
              setClinicName(null);
            } else {
              // Other errors
              console.error("Error fetching clinic:", await res.text());
              setClinicId(null);
              setClinicName(null);
            }
          } catch (err) {
            console.error("Network error fetching clinic:", err);
            setClinicId(null);
            setClinicName(null);
          } finally {
            setCheckingClinic(false);
          }
        } else {
          // c) User is signed out
          setIdToken(null);
          setUser(null);
          setClinicId(null);
          setClinicName(null);
          setCheckingClinic(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const signOutUser = () => {
    auth.signOut(); // Firebase sign out
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
