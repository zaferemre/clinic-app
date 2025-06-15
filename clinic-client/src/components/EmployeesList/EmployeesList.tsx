import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeInfo } from "../../types/sharedTypes";
import { API_BASE } from "../../config/apiConfig";

export const EmployeesList: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!idToken || !companyId) {
      setEmployees([]);
      setOwnerEmail(null);
      setOwnerImageUrl(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) Fetch company info
      const compRes = await fetch(`${API_BASE}/company/${companyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!compRes.ok) throw new Error("Şirket bilgisi alınamadı");
      const comp = await compRes.json();
      setOwnerEmail(comp.ownerEmail ?? null);
      setOwnerImageUrl(comp.ownerImageUrl ?? user?.imageUrl ?? null);

      // 2) Fetch sub-document employees
      const empRes = await fetch(`${API_BASE}/company/${companyId}/employees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!empRes.ok) throw new Error("Çalışanlar yüklenemedi");
      const empArr: EmployeeInfo[] = await empRes.json();

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
  }, [idToken, companyId, user?.imageUrl]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Delete employee
  const handleRemoveEmployee = async (email: string) => {
    if (!idToken || !companyId || email === ownerEmail) return;
    if (!window.confirm("Bu çalışan silinsin mi?")) return;
    setRemovingEmail(email);
    try {
      const res = await fetch(
        `${API_BASE}/company/${companyId}/employees/${encodeURIComponent(
          email
        )}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Silme başarısız.");
      }
      await fetchEmployees();
    } catch (e) {
      console.error(e);
    } finally {
      setRemovingEmail(null);
    }
  };

  // Update employee (role & workingHours)
  const handleUpdateEmployee = async (
    email: string,
    updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
  ) => {
    if (!idToken || !companyId) return;
    setUpdatingEmail(email);
    try {
      const res = await fetch(
        `${API_BASE}/company/${companyId}/employees/${encodeURIComponent(
          email
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(updates),
        }
      );
      if (!res.ok) throw new Error("Güncelleme başarısız.");
      await fetchEmployees();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingEmail(null);
    }
  };

  if (loading) return <p>Çalışanlar yükleniyor…</p>;
  if (error) return <p className="text-red-500">Hata: {error}</p>;
  if (!companyId || ownerEmail === null)
    return <p>Henüz bir şirkete katılmadınız veya bilinmiyor.</p>;
  if (employees.length === 0) return <p>Henüz çalışan eklenmemiş.</p>;

  return (
    <div className="space-y-6 p-4 bg-brand-gray-100 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-brand-black">Çalışanlar</h2>
      <ul className="space-y-3">
        {employees.map((e) => (
          <EmployeeCard
            key={e._id ?? e.email} // guaranteed unique
            employee={e}
            ownerEmail={ownerEmail}
            ownerImageUrl={ownerImageUrl!}
            updatingEmail={updatingEmail}
            removingEmail={removingEmail}
            onRemove={handleRemoveEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            removingId={removingEmail === e.email ? e._id ?? null : null}
          />
        ))}
      </ul>
    </div>
  );
};
