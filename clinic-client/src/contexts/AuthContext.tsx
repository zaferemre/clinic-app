// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
  useMemo,
} from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { getCompanies } from "../api/companyApi";
import { getClinics } from "../api/clinicApi";
import { listEmployees } from "../api/employeeApi";
import type { EmployeeInfo, Clinic, Company } from "../types/sharedTypes";

interface User {
  uid: string;
  email: string;
  name: string;
  imageUrl: string;
  role: string; // "owner" | "admin" | "manager" | "staff" | "other"
}

export interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedCompanyName: string | null;
  setSelectedCompanyName: (name: string | null) => void;
  clinics: Clinic[];
  setClinics: React.Dispatch<React.SetStateAction<Clinic[]>>;
  selectedClinicId: string | null;
  setSelectedClinicId: (id: string | null) => void;
  selectedClinicName: string | null;
  setSelectedClinicName: (name: string | null) => void;
  subscriptionPlan: Company["subscription"]["plan"] | null;
  allowedFeatures: string[];
  maxClinics: number;
  checkingCompany: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const getLS = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const setLS = (key: string, val: string | null) => {
  try {
    if (val) localStorage.setItem(key, val);
    else localStorage.removeItem(key);
  } catch {
    // no-op
  }
};

// --- Helper: Detect owner ---
function isOwner(company: Company | null, email: string): boolean {
  return company?.ownerEmail === email;
}

// --- Helper: Find user role in clinic ---
async function fetchClinicRole(
  idToken: string,
  companyId: string,
  clinicId: string,
  email: string
): Promise<string> {
  try {
    const emps: EmployeeInfo[] = await listEmployees(
      idToken,
      companyId,
      clinicId
    );
    const me = emps.find((e) => e.email === email);
    return me?.role ?? "staff";
  } catch (error) {
    // Optionally log
    console.error("fetchClinicRole failed:", error);
    return "staff";
  }
}

export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyIdRaw] = useState<string | null>(
    getLS("selectedCompanyId") ?? null
  );
  const [selectedCompanyName, setSelectedCompanyNameRaw] = useState<
    string | null
  >(getLS("selectedCompanyName") ?? null);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicIdRaw] = useState<string | null>(
    getLS("selectedClinicId") ?? null
  );
  const [selectedClinicName, setSelectedClinicNameRaw] = useState<
    string | null
  >(getLS("selectedClinicName") ?? null);

  const [checkingCompany, setCheckingCompany] = useState(false);

  // LocalStorage-wrapped setters (no empty blocks)
  const setSelectedCompanyId = useCallback((id: string | null) => {
    setSelectedCompanyIdRaw(id);
    setLS("selectedCompanyId", id);
  }, []);
  const setSelectedCompanyName = useCallback((name: string | null) => {
    setSelectedCompanyNameRaw(name);
    setLS("selectedCompanyName", name);
  }, []);
  const setSelectedClinicId = useCallback((id: string | null) => {
    setSelectedClinicIdRaw(id);
    setLS("selectedClinicId", id);
  }, []);
  const setSelectedClinicName = useCallback((name: string | null) => {
    setSelectedClinicNameRaw(name);
    setLS("selectedClinicName", name);
  }, []);

  // Derived company info
  const selectedCompany = useMemo(
    () => companies.find((c) => c._id === selectedCompanyId) || null,
    [companies, selectedCompanyId]
  );
  const subscriptionPlan = selectedCompany?.subscription.plan ?? null;
  const allowedFeatures = selectedCompany?.subscription.allowedFeatures ?? [];
  const maxClinics = selectedCompany?.subscription.maxClinics ?? 0;

  // Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(
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
          role: "staff",
        });
      }
    );
    return unsub;
  }, []);

  // --- Core company/clinic/role detection logic ---
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      if (!idToken) {
        setCompanies([]);
        setSelectedCompanyId(null);
        setSelectedCompanyName(null);
        setClinics([]);
        setSelectedClinicId(null);
        setSelectedClinicName(null);
        setUser((u) => (u ? { ...u, role: "staff" } : u));
        setCheckingCompany(false);
        return;
      }
      setCheckingCompany(true);

      try {
        const comps = await getCompanies(idToken);
        if (!mounted) return;
        setCompanies(comps);

        // select company
        const compId =
          selectedCompanyId && comps.some((c) => c._id === selectedCompanyId)
            ? selectedCompanyId
            : comps[0]?._id ?? null;
        setSelectedCompanyId(compId);
        setSelectedCompanyName(
          comps.find((c) => c._id === compId)?.name ?? null
        );

        // fetch clinics
        const compClinics = compId ? await getClinics(idToken, compId) : [];
        setClinics(compClinics);

        // Owner check
        const email = auth.currentUser?.email ?? "";
        const companyObj = comps.find((c) => c._id === compId) || null;
        const isUserOwner = isOwner(companyObj, email);

        // select clinic
        let clinicId = selectedClinicId;
        if (compClinics.length > 0) {
          if (
            !selectedClinicId ||
            !compClinics.some((cl) => cl._id === selectedClinicId)
          ) {
            clinicId = compClinics[0]._id;
            setSelectedClinicId(clinicId);
            setSelectedClinicName(compClinics[0].name ?? null);
          }
        }

        // set user role
        setUser((u) =>
          u
            ? {
                ...u,
                role: isUserOwner ? "owner" : u.role ?? "staff", // will be refined below if not owner
              }
            : null
        );

        // if not owner, check user's actual clinic role
        if (!isUserOwner && compId && clinicId && email) {
          const clinicRole = await fetchClinicRole(
            idToken,
            compId,
            clinicId,
            email
          );
          setUser((u) => (u ? { ...u, role: clinicRole } : u));
        }
      } catch (err) {
        // handle error
        console.error("Auth context error:", err);
        setCompanies([]);
        setSelectedCompanyId(null);
        setSelectedCompanyName(null);
        setClinics([]);
        setSelectedClinicId(null);
        setSelectedClinicName(null);
        setUser((u) => (u ? { ...u, role: "staff" } : u));
      } finally {
        if (mounted) setCheckingCompany(false);
      }
    }
    loadAll();
    return () => {
      mounted = false;
    };
    // all referenced in body or setters
  }, [
    idToken,
    selectedCompanyId,
    selectedClinicId,
    setSelectedCompanyId,
    setSelectedCompanyName,
    setSelectedClinicId,
    setSelectedClinicName,
  ]);

  const handleSignOut = useCallback(() => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setCompanies([]);
    setSelectedCompanyId(null);
    setSelectedCompanyName(null);
    setClinics([]);
    setSelectedClinicId(null);
    setSelectedClinicName(null);
    setCheckingCompany(false);
    setLS("selectedCompanyId", null);
    setLS("selectedCompanyName", null);
    setLS("selectedClinicId", null);
    setLS("selectedClinicName", null);
  }, [
    setSelectedCompanyId,
    setSelectedCompanyName,
    setSelectedClinicId,
    setSelectedClinicName,
  ]);

  // Use useMemo for contextValue to avoid unnecessary rerenders
  const contextValue = useMemo(
    () => ({
      idToken,
      user,
      companies,
      setCompanies,
      selectedCompanyId,
      setSelectedCompanyId,
      selectedCompanyName,
      setSelectedCompanyName,
      clinics,
      setClinics,
      selectedClinicId,
      setSelectedClinicId,
      selectedClinicName,
      setSelectedClinicName,
      subscriptionPlan,
      allowedFeatures,
      maxClinics,
      checkingCompany,
      signOut: handleSignOut,
    }),
    [
      idToken,
      user,
      companies,
      setCompanies,
      selectedCompanyId,
      setSelectedCompanyId,
      selectedCompanyName,
      setSelectedCompanyName,
      clinics,
      setClinics,
      selectedClinicId,
      setSelectedClinicId,
      selectedClinicName,
      setSelectedClinicName,
      subscriptionPlan,
      allowedFeatures,
      maxClinics,
      checkingCompany,
      handleSignOut,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContextProvider");
  return ctx;
}
