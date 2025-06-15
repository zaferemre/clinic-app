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
import { getEmployees } from "../api/employeeApi";
import type { EmployeeInfo } from "../types/sharedTypes";

interface User {
  uid: string;
  email: string;
  name: string;
  role: string; // now required
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

  // 1. Listen for Firebase Auth changes
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
          role: "staff", // temporary default
        });
      }
    );
    return unsubscribe;
  }, []);

  // 2. When the token changes, fetch company & assign real role
  useEffect(() => {
    if (!idToken) {
      setCompanyId(null);
      setCompanyName(null);
      setCheckingCompany(false);
      return;
    }

    let isMounted = true;
    setCheckingCompany(true);

    (async () => {
      try {
        const company = await getCompanyByEmail(idToken);
        if (!isMounted) return;

        if (company?._id) {
          setCompanyId(company._id);
          setCompanyName(company.name);

          // grab the email of the currently signed-in user
          const email = auth.currentUser?.email ?? "";
          const isOwner = company.ownerEmail === email;

          // 2.a) Owner → role = "owner"
          setUser((u) => (u ? { ...u, role: isOwner ? "owner" : "staff" } : u));

          // 2.b) Non-owner → fetch their employee record to get the real role
          if (!isOwner) {
            const employees: EmployeeInfo[] = await getEmployees(
              idToken,
              company._id
            );
            if (!isMounted) return;
            const me = employees.find((e) => e.email === email);
            setUser((u) => (u ? { ...u, role: me?.role ?? "staff" } : u));
          }
        } else {
          // no company found → default role
          setCompanyId(null);
          setCompanyName(null);
          setUser((u) => (u ? { ...u, role: "staff" } : u));
        }
      } catch {
        setCompanyId(null);
        setCompanyName(null);
        setUser((u) => (u ? { ...u, role: "staff" } : u));
      } finally {
        if (isMounted) setCheckingCompany(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [idToken]); // ← only re-run when the token itself changes

  const signOutUser = React.useCallback(() => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setCompanyId(null);
    setCompanyName(null);
    setCheckingCompany(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        idToken,
        user,
        companyId,
        companyName,
        checkingCompany,
        setCompanyId,
        setCompanyName,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextProps {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
}
