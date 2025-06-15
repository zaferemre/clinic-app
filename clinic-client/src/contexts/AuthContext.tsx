// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getCompanyByEmail } from "../api/companyApi";
import type { Company } from "../types/sharedTypes";

interface User {
  uid: string;
  email: string;
  name: string;
  role?: string;
  imageUrl: string;
}

interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  companyId: string | null;
  companyName: string | null;
  checkingCompany: boolean;
  setCompanyId: (id: string | null) => void;
  setCompanyName: (name: string | null) => void;
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
  const [checkingCompany, setCheckingCompany] = useState<boolean>(false);

  // Subscribe to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        if (!fbUser) {
          setIdToken(null);
          setUser(null);
          return;
        }
        const token = await fbUser.getIdToken();
        setIdToken(token);
        setUser({
          uid: fbUser.uid,
          email: fbUser.email ?? "",
          name: fbUser.displayName ?? "",
          imageUrl: fbUser.photoURL ?? "",
        });
      }
    );
    return unsubscribe;
  }, []);

  // Fetch company info when idToken changes
  useEffect(() => {
    if (!idToken) {
      setCompanyId(null);
      setCompanyName(null);
      setCheckingCompany(false);
      return;
    }
    setCheckingCompany(true);
    getCompanyByEmail(idToken)
      .then((company: Company | null) => {
        if (company?._id) {
          setCompanyId(company._id);
          setCompanyName(company.name);
        } else {
          setCompanyId(null);
          setCompanyName(null);
        }
      })
      .catch(() => {
        setCompanyId(null);
        setCompanyName(null);
      })
      .finally(() => {
        setCheckingCompany(false);
      });
  }, [idToken]);

  const signOutUser = React.useCallback(() => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setCompanyId(null);
    setCompanyName(null);
    setCheckingCompany(false);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      idToken,
      user,
      companyId,
      companyName,
      checkingCompany,
      setCompanyId,
      setCompanyName,
      signOut: signOutUser,
    }),
    [
      idToken,
      user,
      companyId,
      companyName,
      checkingCompany,
      setCompanyId,
      setCompanyName,
      signOutUser,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
