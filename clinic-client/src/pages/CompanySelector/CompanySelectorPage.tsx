// src/pages/CompanySelector/CompanySelectorPage.tsx
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function CompanySelectorPage() {
  const { companies, setSelectedCompanyId, setSelectedCompanyName, signOut } =
    useAuth();
  const navigate = useNavigate();

  const handleSelect = (company: any) => {
    console.log("Selecting company:", company);

    setSelectedCompanyId(company._id);
    setSelectedCompanyName(company.name);
    localStorage.removeItem("selectedClinicId");
    localStorage.removeItem("selectedClinicName");
    // Force context update:

    navigate("/clinics", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h2 className="text-2xl font-bold mb-4">Bir şirket seçin</h2>
      <div className="w-full max-w-md space-y-4">
        {companies.map((c) => (
          <button
            key={c._id}
            onClick={() => handleSelect(c)}
            className="w-full px-4 py-3 rounded-xl bg-brand-main/10 hover:bg-brand-main/20 text-brand-main font-semibold shadow"
          >
            {c.name}
          </button>
        ))}
      </div>
      <button className="mt-8 text-red-500 underline" onClick={signOut}>
        Çıkış Yap
      </button>
    </div>
  );
}
