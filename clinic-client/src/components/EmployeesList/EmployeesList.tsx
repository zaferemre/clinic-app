// src/components/EmployeesList.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { EmployeeCard } from "./EmployeeCard";
import { IEmployee } from "../../types/sharedTypes";
import { API_BASE } from "../../config/apiConfig";

export const EmployeesList: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  const fetchEmployees = async () => {
    if (!idToken || !companyId) {
      setEmployees([]);
      setOwnerEmail(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // 1. Get company info (to get ownerEmail etc)
      const companyInfoRes = await fetch(`${API_BASE}/company/${companyId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!companyInfoRes.ok)
        throw new Error("Şirket bulunamadı veya sunucu hatası");
      const companyData = await companyInfoRes.json();
      setOwnerEmail(companyData.ownerEmail);

      // 2. Get employees for this company
      const employeesRes = await fetch(
        `${API_BASE}/company/${companyId}/employees`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (!employeesRes.ok) throw new Error("Çalışanlar yüklenemedi");
      const employeesArr: IEmployee[] = await employeesRes.json();

      // 3. Ensure owner is included as first "employee"
      if (
        companyData.ownerEmail &&
        !employeesArr.some((e) => e.email === companyData.ownerEmail)
      ) {
        employeesArr.unshift({
          _id: "owner",
          email: companyData.ownerEmail,
          name: companyData.ownerName || companyData.ownerEmail,
          role: "owner",
          pictureUrl: user?.imageUrl || "",
        });
      }

      setEmployees(employeesArr);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Çalışanlar yüklenirken hata oluştu."
      );
      setEmployees([]);
      setOwnerEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, companyId]);

  // --- helpers (update & remove) ---
  const refetchEmployees = async () => {
    await fetchEmployees();
  };

  const handleChangeRole = async (email: string, newRole: string) => {
    if (!idToken || !companyId || email === ownerEmail) return; // don't change owner role
    setUpdatingEmail(email);
    try {
      const res = await fetch(
        `${API_BASE}/company/employees/${encodeURIComponent(email)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Rol güncellenirken hata oluştu.");
      }
      await refetchEmployees();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Rol güncellenirken hata oluştu.");
      } else {
        setError("Rol güncellenirken hata oluştu.");
      }
    } finally {
      setUpdatingEmail(null);
    }
  };

  const handleRemoveEmployee = async (email: string) => {
    if (!idToken || !companyId || email === ownerEmail) return; // don't remove owner
    if (!window.confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) {
      return;
    }
    setRemovingEmail(email);
    try {
      const res = await fetch(
        `${API_BASE}/company/employees/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Çalışan silinirken hata oluştu.");
      }
      await refetchEmployees();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Çalışan silinirken hata oluştu.");
      } else {
        setError("Çalışan silinirken hata oluştu.");
      }
    } finally {
      setRemovingEmail(null);
    }
  };

  // --- RENDER ---
  if (loading) return <p>Çalışanlar yükleniyor...</p>;
  if (error) return <p className="text-brand-red-500">Hata: {error}</p>;
  if (!companyId || ownerEmail === null)
    return <p>Şirket bilgisi yok veya henüz bir şirkete katılmadınız.</p>;
  if (employees.length === 0) return <p>Henüz hiçbir çalışan eklenmemiş.</p>;

  return (
    <div className="space-y-6 p-4 bg-brand-gray-100 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-brand-black">Çalışanlar</h2>
      <ul className="space-y-3">
        {employees.map((e) => (
          <EmployeeCard
            key={e._id}
            employee={e}
            ownerEmail={ownerEmail}
            updatingEmail={updatingEmail}
            removingEmail={removingEmail}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveEmployee}
          />
        ))}
      </ul>
    </div>
  );
};
