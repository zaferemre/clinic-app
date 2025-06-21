import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import EmployeeCard from "./EmployeeCard";
import type { EmployeeInfo } from "../../types/sharedTypes";
import {
  listEmployees,
  updateEmployee,
  removeEmployee,
} from "../../api/employeeApi";
import { API_BASE } from "../../config/apiConfig";

export const EmployeesList: React.FC = () => {
  const {
    idToken,
    selectedCompanyId: companyId,
    selectedClinicId: clinicId,
    user,
  } = useAuth();

  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  // Fetch employees list, always scoped to selected company & clinic
  const fetchEmployees = useCallback(async () => {
    if (!idToken || !companyId || !clinicId) {
      setEmployees([]);
      setOwnerEmail(null);
      setOwnerImageUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Fetch company for owner info
      const compRes = await fetch(`${API_BASE}/company/${companyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!compRes.ok) throw new Error("Şirket bilgisi alınamadı");
      const comp = await compRes.json();
      setOwnerEmail(comp.ownerEmail ?? user?.email ?? null);
      setOwnerImageUrl(comp.ownerImageUrl ?? user?.imageUrl ?? null);

      // 2) Fetch employees via API
      const empArr = await listEmployees(idToken, companyId, clinicId);

      // 3) Prepend owner if missing
      if (comp.ownerEmail) {
        const ownerKey = comp.ownerEmail.toLowerCase().trim();
        const exists = empArr.some(
          (e) => e.email.toLowerCase().trim() === ownerKey
        );
        if (!exists) {
          empArr.unshift({
            _id: "owner",
            email: comp.ownerEmail,
            name: comp.ownerName ?? comp.ownerEmail,
            role: "owner",
            pictureUrl: comp.ownerImageUrl ?? user?.imageUrl ?? "",
            workingHours: [],
          });
        }
      }

      // 4) Dedupe by email
      const unique = new Map<string, EmployeeInfo>();
      empArr.forEach((e) => unique.set(e.email.toLowerCase().trim(), e));
      setEmployees(Array.from(unique.values()));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata");
      setEmployees([]);
      setOwnerEmail(null);
      setOwnerImageUrl(null);
    } finally {
      setLoading(false);
    }
  }, [idToken, companyId, clinicId, user?.email, user?.imageUrl]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Remove employee (API)
  const handleRemoveEmployee = async (email: string) => {
    if (!idToken || !companyId || !clinicId || email === ownerEmail) return;
    if (!window.confirm("Bu çalışan silinsin mi?")) return;
    setRemovingEmail(email);
    try {
      await removeEmployee(idToken, companyId, clinicId, email);
      await fetchEmployees();
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingEmail(null);
    }
  };

  // Update employee (role & workingHours, API)
  const handleUpdateEmployee = async (
    email: string,
    updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
  ) => {
    if (!idToken || !companyId || !clinicId) return;
    setUpdatingEmail(email);
    try {
      await updateEmployee(idToken, companyId, clinicId, email, updates);
      await fetchEmployees();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingEmail(null);
    }
  };

  // --- UI ---
  if (loading)
    return (
      <div className="flex justify-center py-8">
        <span className="text-brand-main font-medium animate-pulse">
          Çalışanlar yükleniyor…
        </span>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center py-8">
        <span className="text-red-500 font-medium">{error}</span>
      </div>
    );
  if (!companyId || !clinicId || ownerEmail === null)
    return (
      <div className="flex justify-center py-8">
        <span>Henüz bir şirkete/kliniğe katılmadınız veya bilinmiyor.</span>
      </div>
    );
  if (employees.length === 0)
    return (
      <div className="flex justify-center py-8">
        <span>Henüz çalışan eklenmemiş.</span>
      </div>
    );

  return (
    <div className="space-y-5  p-4 bg-white rounded-xl shadow-md">
      <ul className="space-y-3">
        {employees.map((e) => (
          <li key={e._id ?? e.email}>
            <EmployeeCard
              employee={e}
              ownerEmail={ownerEmail}
              ownerImageUrl={ownerImageUrl!}
              updatingEmail={updatingEmail}
              removingEmail={removingEmail}
              onRemove={handleRemoveEmployee}
              onUpdateEmployee={handleUpdateEmployee}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
