import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getCompanyByEmail } from "../api/companyApi"; // new import

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
  setCompanyId: (id: string) => void;
  setCompanyName: (name: string) => void;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        // Logged out
        setIdToken(null);
        setUser(null);
        setCompanyId(null);
        setCompanyName(null);
        setCheckingCompany(false);
        return;
      }

      try {
        const token = await fbUser.getIdToken();
        setIdToken(token);

        setUser({
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: fbUser.displayName || "",
          imageUrl: fbUser.photoURL || "",
        });

        setCheckingCompany(true);
        try {
          const company = await getCompanyByEmail(token);
          setCompanyId(company._id);
          setCompanyName(company.name);
        } catch (e: unknown) {
          if (e && typeof e === "object" && "message" in e) {
            console.warn(
              "No company found for this user:",
              (e as { message?: string }).message
            );
          } else {
            console.warn("No company found for this user:", e);
          }
          setCompanyId(null);
          setCompanyName(null);
        }
      } catch (err) {
        console.error("Auth context error:", err);
        setCompanyId(null);
        setCompanyName(null);
      } finally {
        setCheckingCompany(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
        setCompanyId,
        setCompanyName,
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
