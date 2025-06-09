import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { EmployeeCard } from "./EmployeeCard";
import { IEmployee, WorkingHour } from "../../types/sharedTypes";
import { API_BASE } from "../../config/apiConfig";

export const EmployeesList: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [ownerImageUrl, setOwnerImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchEmployees = async () => {
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
      // 1) Get company metadata
      const compRes = await fetch(`${API_BASE}/company/${companyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!compRes.ok) throw new Error("Şirket bilgisi alınamadı");
      const comp = await compRes.json();
      setOwnerEmail(comp.ownerEmail);
      setOwnerImageUrl(comp.ownerImageUrl ?? null);

      // 2) Get sub‐document employees
      const empRes = await fetch(`${API_BASE}/company/${companyId}/employees`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!empRes.ok) throw new Error("Çalışanlar yüklenemedi");
      const empArr: IEmployee[] = await empRes.json();

      // 3) Prepend owner if missing
      if (comp.ownerEmail && !empArr.some((e) => e.email === comp.ownerEmail)) {
        empArr.unshift({
          _id: "owner",
          email: comp.ownerEmail,
          name: comp.ownerName || comp.ownerEmail,
          role: "owner",
          pictureUrl: comp.ownerImageUrl || user?.imageUrl || "",
          workingHours: [],
        });
      }

      setEmployees(empArr);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Çalışanlar yüklenirken bir hata oluştu."
      );
      setEmployees([]);
      setOwnerEmail(null);
      setOwnerImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [idToken, companyId]);

  // Re-fetch helper
  const refetch = async () => {
    await fetchEmployees();
  };

  // Delete employee (owner only)
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
      await refetch();
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setRemovingEmail(null);
    }
  };

  // Update employee (role & workingHours)
  const handleUpdateEmployee = async (
    email: string,
    updates: { role: IEmployee["role"]; workingHours?: WorkingHour[] }
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
      await refetch();
    } catch (err) {
      console.error(err);
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
            key={e._id}
            employee={e}
            ownerEmail={ownerEmail}
            ownerImageUrl={ownerImageUrl!}
            updatingEmail={updatingEmail}
            removingEmail={removingEmail}
            onRemove={handleRemoveEmployee}
            onUpdateEmployee={handleUpdateEmployee}
          />
        ))}
      </ul>
    </div>
  );
};
