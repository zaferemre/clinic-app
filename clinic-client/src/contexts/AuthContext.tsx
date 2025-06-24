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
import { getCurrentUser } from "../api/userApi";
import type {
  User,
  Company,
  Clinic,
  UserMembership,
} from "../types/sharedTypes";

// --------- LocalStorage helpers ---------
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
  } catch {}
};

// --------- Context definition ---------
export interface AuthContextProps {
  idToken: string | null;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  memberships: UserMembership[];
  setMemberships: React.Dispatch<React.SetStateAction<UserMembership[]>>;
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
  checkingCompany: boolean;
  needsSignup: boolean;
  signOut: () => void;
  refreshUserContext: () => Promise<void>; // NEW
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// --------- Provider Component ---------
export const AuthContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // --- State setup ---
  const [idToken, setIdToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);

  // Selection: company/clinic, plus names (LS = localStorage)
  const [selectedCompanyId, setSelectedCompanyIdRaw] = useState<string | null>(
    getLS("selectedCompanyId")
  );
  const [selectedCompanyName, setSelectedCompanyNameRaw] = useState<
    string | null
  >(getLS("selectedCompanyName"));
  const [selectedClinicId, setSelectedClinicIdRaw] = useState<string | null>(
    getLS("selectedClinicId")
  );
  const [selectedClinicName, setSelectedClinicNameRaw] = useState<
    string | null
  >(getLS("selectedClinicName"));

  // For auth lifecycle
  const [checkingCompany, setCheckingCompany] = useState(false);
  const [needsSignup, setNeedsSignup] = useState(false);

  // --- Setters that also sync localStorage & reset dependent data ---
  const setSelectedCompanyId = useCallback((id: string | null) => {
    setSelectedCompanyIdRaw(id);
    setLS("selectedCompanyId", id);
    // When switching company, always reset clinic selection as well
    setSelectedClinicIdRaw(null);
    setLS("selectedClinicId", null);
    setSelectedClinicNameRaw(null);
    setLS("selectedClinicName", null);
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

  // --------- REFETCH user & memberships (hot-reload context) ---------
  const refreshUserContext = useCallback(async () => {
    if (!auth.currentUser) return;
    setCheckingCompany(true);
    const token = await auth.currentUser.getIdToken();
    setIdToken(token);
    try {
      const userDataRaw = await getCurrentUser(token);
      const safeMemberships: UserMembership[] = Array.isArray(
        userDataRaw?.memberships
      )
        ? userDataRaw.memberships
        : [];
      setUser({ ...userDataRaw, photoUrl: userDataRaw.photoUrl ?? "" });
      setMemberships(safeMemberships);

      // Companies
      const companiesMap = new Map<string, Company>();
      safeMemberships.forEach((m) => {
        if (m.companyId && !companiesMap.has(m.companyId)) {
          companiesMap.set(m.companyId, {
            _id: m.companyId,
            name: m.companyName,
          } as Company);
        }
      });
      const companiesArr = Array.from(companiesMap.values());
      setCompanies(companiesArr);

      // Company selection
      const storedCompanyId = getLS("selectedCompanyId");
      const compId =
        storedCompanyId && companiesArr.some((c) => c._id === storedCompanyId)
          ? storedCompanyId
          : companiesArr[0]?._id ?? null;
      setSelectedCompanyIdRaw(compId);
      setSelectedCompanyNameRaw(
        companiesArr.find((c) => c._id === compId)?.name ?? null
      );

      // Clinics for selected company (from memberships)
      const clinicsArr = safeMemberships
        .filter((m) => m.companyId === compId && m.clinicId)
        .map(
          (m) =>
            ({
              _id: m.clinicId!,
              name: m.clinicName,
              companyId: m.companyId,
            } as Clinic)
        );
      setClinics(clinicsArr);

      // Clinic selection
      const storedClinicId = getLS("selectedClinicId");
      const clinicId =
        storedClinicId && clinicsArr.some((cl) => cl._id === storedClinicId)
          ? storedClinicId
          : clinicsArr[0]?._id ?? null;
      setSelectedClinicIdRaw(clinicId);
      setSelectedClinicNameRaw(
        clinicsArr.find((cl) => cl._id === clinicId)?.name ?? null
      );

      setNeedsSignup(false);
    } catch (error: any) {
      if (error.status === 500) setNeedsSignup(true);
      else setNeedsSignup(false);
      setUser(null);
      setMemberships([]);
      setCompanies([]);
      setClinics([]);
      setIdToken(token);
      setSelectedCompanyIdRaw(null);
      setSelectedCompanyNameRaw(null);
      setSelectedClinicIdRaw(null);
      setSelectedClinicNameRaw(null);
    }
    setCheckingCompany(false);
  }, []);

  // --------- AUTH HANDLING ---------
  useEffect(() => {
    // Listen to Firebase Auth
    const unsub = onAuthStateChanged(
      auth,
      async (fbUser: FirebaseUser | null) => {
        if (!fbUser) {
          setIdToken(null);
          setUser(null);
          setMemberships([]);
          setCompanies([]);
          setClinics([]);
          setSelectedCompanyIdRaw(null);
          setSelectedCompanyNameRaw(null);
          setSelectedClinicIdRaw(null);
          setSelectedClinicNameRaw(null);
          setCheckingCompany(false);
          setNeedsSignup(false);
          return;
        }
        await refreshUserContext();
      }
    );
    return unsub;
    // eslint-disable-next-line
  }, [refreshUserContext]);

  // --------- On company/clinic change, recalculate clinics etc ---------
  useEffect(() => {
    if (!memberships || !selectedCompanyId) {
      setClinics([]);
      setSelectedClinicIdRaw(null);
      setSelectedClinicNameRaw(null);
      return;
    }
    // Get clinics for *currently selected* company from user memberships
    const clinicsArr = memberships
      .filter((m) => m.companyId === selectedCompanyId && m.clinicId)
      .map(
        (m) =>
          ({
            _id: m.clinicId!,
            name: m.clinicName,
            companyId: m.companyId,
          } as Clinic)
      );
    setClinics(clinicsArr);

    // If current clinic is no longer valid, auto-select the first available
    if (
      selectedClinicId &&
      !clinicsArr.some((cl) => cl._id === selectedClinicId)
    ) {
      const firstClinic = clinicsArr[0];
      setSelectedClinicIdRaw(firstClinic?._id ?? null);
      setSelectedClinicNameRaw(firstClinic?.name ?? null);
    }
    // eslint-disable-next-line
  }, [memberships, selectedCompanyId]);

  // --------- LOGOUT ---------
  const handleSignOut = useCallback(() => {
    auth.signOut();
    setIdToken(null);
    setUser(null);
    setMemberships([]);
    setCompanies([]);
    setClinics([]);
    setCheckingCompany(false);
    setNeedsSignup(false);
    setSelectedCompanyIdRaw(null);
    setSelectedCompanyNameRaw(null);
    setSelectedClinicIdRaw(null);
    setSelectedClinicNameRaw(null);
  }, []);

  // --------- CONTEXT VALUE ---------
  const contextValue = useMemo(
    () => ({
      idToken,
      user,
      setUser,
      memberships,
      setMemberships,
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
      checkingCompany,
      needsSignup,
      signOut: handleSignOut,
      refreshUserContext, // <--- HERE!
    }),
    [
      idToken,
      user,
      setUser,
      memberships,
      setMemberships,
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
      checkingCompany,
      needsSignup,
      handleSignOut,
      refreshUserContext,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// --------- Hook ---------
export function useAuth(): AuthContextProps {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthContextProvider");
  return ctx;
}
