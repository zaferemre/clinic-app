// src/components/WorkersList.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { WorkerCard } from "./WorkerCard";
import { IWorker } from "../../types";

const API_BASE = import.meta.env.VITE_RAILWAY_LINK || "http://localhost:3001"; // Use VITE_API_BASE from .env or fallback to localhost

export const WorkersList: React.FC = () => {
  const { idToken, clinicId } = useAuth();
  const [workers, setWorkers] = useState<IWorker[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  // ─── Fetch only the workers array via GET /clinic/:clinicId/workers ───
  const fetchWorkers = async () => {
    if (!idToken || !clinicId) {
      setWorkers([]);
      setOwnerEmail(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1) First, fetch the clinic’s ownerEmail (so we know who the owner is)
      const clinicRes = await fetch(`${API_BASE}/clinic/${clinicId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (clinicRes.status === 404) {
        setError("Klinik bulunamadı.");
        setWorkers([]);
        setOwnerEmail(null);
        setLoading(false);
        return;
      }
      if (!clinicRes.ok) {
        throw new Error(`Sunucu hatası (status ${clinicRes.status})`);
      }
      const clinicData = await clinicRes.json();
      setOwnerEmail(clinicData.ownerEmail || null);

      // 2) Now fetch just the workers array
      const res = await fetch(`${API_BASE}/clinic/${clinicId}/workers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Sunucu hatası (status ${res.status})`);
      }
      const workersArr = await res.json();
      // Expect workersArr: IWorker[]
      setWorkers(Array.isArray(workersArr) ? workersArr : []);
    } catch (err: any) {
      console.error("Error fetching workers:", err);
      setError(err.message || "Çalışanlar yüklenirken hata oluştu.");
      setWorkers([]);
      setOwnerEmail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, clinicId]);

  // Helper to re‐fetch the list (e.g. after update or delete)
  const refetchWorkers = async () => {
    await fetchWorkers();
  };

  const handleChangeRole = async (workerEmail: string, newRole: string) => {
    if (!idToken || !clinicId) return;
    setUpdatingEmail(workerEmail);
    try {
      const res = await fetch(
        `${API_BASE}/clinic/${clinicId}/workers/${encodeURIComponent(
          workerEmail
        )}`,
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
        throw new Error(
          errData.error || `Güncelleme hatası (status ${res.status})`
        );
      }
      await refetchWorkers();
    } catch (err: any) {
      console.error("Error updating role:", err);
      setError(err.message || "Rol güncellenirken hata oluştu.");
    } finally {
      setUpdatingEmail(null);
    }
  };

  const handleRemoveWorker = async (workerEmail: string) => {
    if (!idToken || !clinicId) return;
    if (!window.confirm("Bu çalışanı silmek istediğinizden emin misiniz?")) {
      return;
    }
    setRemovingEmail(workerEmail);
    try {
      const res = await fetch(
        `${API_BASE}/clinic/${clinicId}/workers/${encodeURIComponent(
          workerEmail
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Silme hatası (status ${res.status})`);
      }
      await refetchWorkers();
    } catch (err: any) {
      console.error("Error removing worker:", err);
      setError(err.message || "Çalışan silinirken hata oluştu.");
    } finally {
      setRemovingEmail(null);
    }
  };

  if (loading) {
    return (
      <p className="text-brand-gray-600 font-sans">Çalışanlar yükleniyor...</p>
    );
  }

  if (error) {
    return <p className="text-brand-red-500 font-sans">Hata: {error}</p>;
  }

  if (!clinicId || ownerEmail === null) {
    return (
      <p className="text-brand-gray-600 font-sans">
        Klinik bilgisi bulunamadı veya henüz bir kliniğe katılmadınız.
      </p>
    );
  }

  if (workers.length === 0) {
    return (
      <p className="text-brand-gray-600 font-sans">
        Henüz hiçbir çalışan eklenmemiş.
      </p>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-brand-gray-100 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold text-brand-black font-sans">
        Çalışanlar
      </h2>

      <ul className="space-y-3">
        {workers.map((w) => (
          <WorkerCard
            key={w._id}
            worker={w}
            ownerEmail={ownerEmail}
            updatingEmail={updatingEmail}
            removingEmail={removingEmail}
            onChangeRole={handleChangeRole}
            onRemove={handleRemoveWorker}
          />
        ))}
      </ul>
    </div>
  );
};
