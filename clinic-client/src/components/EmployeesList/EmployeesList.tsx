import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import EmployeeCard from "./EmployeeCard";
import type { EmployeeInfo } from "../../types/sharedTypes";
import {
  listEmployees,
  updateEmployee,
  removeEmployee,
} from "../../api/employeeApi";
import { getCompanyById } from "../../api/companyApi";

export const EmployeesList: React.FC = () => {
  const {
    idToken,
    selectedCompanyId: companyId,
    selectedClinicId: clinicId,
    user,
  } = useAuth();

  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    if (!idToken || !companyId || !clinicId) {
      setEmployees([]);
      setOwnerUserId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const company = await getCompanyById(idToken, companyId);
      setOwnerUserId(company.ownerUserId);

      const empArr = await listEmployees(idToken, companyId, clinicId);

      // If owner not in employees, add as first
      if (
        company.ownerUserId &&
        !empArr.some((e) => e.userId === company.ownerUserId)
      ) {
        empArr.unshift({
          userId: company.ownerUserId,
          name: user?.name ?? "Owner",
          role: ["owner"], // always as array
          pictureUrl: user?.photoUrl || "",
          services: [],
          workingHours: [],
          companyId,
          clinicId,
        });
      }

      setEmployees(empArr);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Beklenmeyen hata");
      setEmployees([]);
      setOwnerUserId(null);
    } finally {
      setLoading(false);
    }
  }, [idToken, companyId, clinicId, user?.name, user?.photoUrl]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleRemove = async (userId: string) => {
    if (!idToken || !companyId || !clinicId || userId === ownerUserId) return;
    if (!window.confirm("Bu çalışan silinsin mi?")) return;
    setRemovingId(userId);
    try {
      await removeEmployee(idToken, companyId, clinicId, userId);
      await fetchEmployees();
    } finally {
      setRemovingId(null);
    }
  };

  const handleUpdate = async (
    userId: string,
    updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
  ) => {
    if (!idToken || !companyId || !clinicId) return;
    setUpdatingId(userId);
    try {
      await updateEmployee(idToken, companyId, clinicId, userId, updates);
      await fetchEmployees();
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading)
    return <div className="py-8 text-center">Çalışanlar yükleniyor…</div>;
  if (error)
    return <div className="py-8 text-center text-red-500">{error}</div>;
  if (!companyId || !clinicId || ownerUserId === null)
    return (
      <div className="py-8 text-center">
        Henüz bir şirkete veya kliniğe katılmadınız.
      </div>
    );
  if (employees.length === 0)
    return <div className="py-8 text-center">Henüz çalışan eklenmemiş.</div>;

  return (
    <ul className="space-y-3 p-4 bg-white rounded-xl shadow-md">
      {employees.map((e) => (
        <li key={e.userId}>
          <EmployeeCard
            employee={e}
            ownerUserId={ownerUserId}
            updatingId={updatingId}
            removingId={removingId}
            onRemove={handleRemove}
            onUpdateEmployee={(
              userId,
              updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
            ) => handleUpdate(userId, updates)}
          />
        </li>
      ))}
    </ul>
  );
};

export default EmployeesList;
