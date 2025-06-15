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
import { getCompanyByEmail } from "../api/companyApi";
import type { Company } from "../types/sharedTypes";

interface User {
  uid: string;
  email: string;
  name: string;
  imageUrl: string;
}

interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  companyId: string | null;
  companyName: string | null;
  checkingCompany: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [checkingCompany, setCheckingCompany] = useState(false);

  // 1) Subscribe to Firebase auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        console.log("🔒 not logged in");
        setIdToken(null);
        setUser(null);
        return;
      }
      const token = await fbUser.getIdToken();
      console.log("🔑 got idToken", token.slice(0, 5), "...");

      setIdToken(token);
      setUser({
        uid: fbUser.uid,
        email: fbUser.email || "",
        name: fbUser.displayName || "",
        imageUrl: fbUser.photoURL || "",
      });
    });
    return unsub;
  }, []);

  // 2) Whenever idToken changes, fetch the company
  useEffect(() => {
    // if not logged in, clear out
    if (!idToken) {
      console.log("❌ clearing company because no token");
      setCompanyId(null);
      setCompanyName(null);
      setCheckingCompany(false);
      return;
    }

    // otherwise, start the lookup
    setCheckingCompany(true);
    console.log("⏳ fetching company for token…");
    getCompanyByEmail(idToken)
      .then((company: Company | null) => {
        console.log("🏢 company response:", company);
        if (company && company._id) {
          setCompanyId(company._id);
          setCompanyName(company.name);
          console.log("✅ companyId set to", company._id);
        } else {
          setCompanyId(null);
          setCompanyName(null);
          console.log("⚠️ company was null or missing _id");
        }
      })
      .catch((err) => {
        console.warn("🚨 error fetching company:", err);
        setCompanyId(null);
        setCompanyName(null);
      })
      .finally(() => {
        setCheckingCompany(false);
      });
  }, [idToken]);

  const signOutUser = () => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setCompanyId(null);
    setCompanyName(null);
    setCheckingCompany(false);
  };

  return (
    <AuthContext.Provider
      value={{
        idToken,
        user,
        companyId,
        companyName,
        checkingCompany,
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
    throw new Error("useAuth must be used inside <AuthContextProvider>");
  }
  return ctx;
}
