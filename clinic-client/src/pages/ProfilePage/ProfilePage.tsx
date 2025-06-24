// src/pages/ProfilePage/ProfilePage.tsx
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import ProfileCreateCompanyButton from "../../components/Button/ProfileCreateCompanyButton";
import ProfileCreateClinicButton from "../../components/Button/ProfileCreateClinicButton";
import { BuildingOffice2Icon, PlusIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    companies,
    clinics,
    memberships,
    selectedCompanyId,
    selectedClinicId,
    setSelectedCompanyId,
    setSelectedClinicId,
    setSelectedClinicName,
  } = useAuth();

  // Determine user role in current context
  const userRole = useMemo(() => {
    const mem =
      memberships.find(
        (m) =>
          m.companyId === selectedCompanyId && m.clinicId === selectedClinicId
      ) || memberships.find((m) => m.companyId === selectedCompanyId);
    const role = mem
      ? Array.isArray(mem.roles)
        ? mem.roles[0]
        : mem.roles
      : "staff";
    return role || "staff";
  }, [memberships, selectedCompanyId, selectedClinicId]);

  const isOwner = userRole === "owner";

  const handleCompanyCreated = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };
  const handleClinicCreated = (clinicId: string, clinicName: string) => {
    setSelectedClinicId(clinicId);
    setSelectedClinicName(clinicName);
  };

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100 pb-16">
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <DashboardHeader />

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-6 relative">
          <img
            src={user?.photoUrl}
            alt={user?.name}
            className="w-24 h-24 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Rol:</span>{" "}
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>
          <button
            onClick={() =>
              navigate(`/clinics/${selectedCompanyId}/settings/user`)
            }
            className="absolute top-4 right-4 text-sm text-brand-main font-medium hover:underline"
          >
            Düzenle
          </button>
        </div>

        {/* Companies Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Şirketler</h3>
            <ProfileCreateCompanyButton onCreated={handleCompanyCreated} />
          </div>
          {companies.length === 0 ? (
            <div className="text-gray-400 italic">
              Henüz bir şirkete üye değilsiniz.
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <div
                  key={company._id}
                  className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                    company._id === selectedCompanyId
                      ? "border-brand-main"
                      : "border-transparent"
                  } hover:shadow-md transition`}
                >
                  <div className="flex items-center gap-3">
                    <BuildingOffice2Icon className="h-6 w-6 text-brand-main" />
                    <span className="font-medium text-gray-800">
                      {company.name}
                    </span>
                  </div>
                  {company._id !== selectedCompanyId ? (
                    <button
                      onClick={() => setSelectedCompanyId(company._id)}
                      className="px-3 py-1 bg-brand-main text-white rounded-full text-xs hover:bg-brand-dark transition"
                    >
                      Seç
                    </button>
                  ) : (
                    <span className="text-xs text-brand-main font-semibold">
                      Seçili
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinics Section */}
        {selectedCompanyId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Klinikler</h3>
              {isOwner && (
                <ProfileCreateClinicButton onCreated={handleClinicCreated} />
              )}
            </div>
            {clinics.length === 0 ? (
              <div className="text-gray-400 italic">
                Bu şirkette klinik yok.
              </div>
            ) : (
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic._id}
                    className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                      clinic._id === selectedClinicId
                        ? "border-brand-main"
                        : "border-transparent"
                    } hover:shadow-md transition`}
                  >
                    <div className="flex items-center gap-3">
                      <PlusIcon className="h-6 w-6 text-brand-main" />
                      <span className="font-medium text-gray-800">
                        {clinic.name}
                      </span>
                    </div>
                    {clinic._id !== selectedClinicId ? (
                      <button
                        onClick={() => {
                          setSelectedClinicId(clinic._id);
                          setSelectedClinicName(clinic.name);
                        }}
                        className="px-3 py-1 bg-brand-main text-white rounded-full text-xs hover:bg-brand-dark transition"
                      >
                        Seç
                      </button>
                    ) : (
                      <span className="text-xs text-brand-main font-semibold">
                        Seçili
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <NavigationBar />
    </div>
  );
}
