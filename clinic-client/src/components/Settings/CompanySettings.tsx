import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyById, updateCompany } from "../../api/companyApi";

const CompanySettings: React.FC = () => {
  const { companyId, idToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    ownerName: "",
    companyType: "",
    websiteUrl: "",
    googleUrl: "",
    address: "",
    phoneNumber: "",
    ownerImageUrl: "",
    companyImgUrl: "",
  });

  useEffect(() => {
    const fetchCompany = async () => {
      if (!idToken || !companyId) return;
      const company = await getCompanyById(idToken, companyId);
      setFormData({
        name: company.name ?? "",
        ownerName: company.ownerName ?? "",
        companyType: company.companyType ?? "",
        websiteUrl: company.websiteUrl ?? "",
        googleUrl: company.googleUrl ?? "",
        address: company.address ?? "",
        phoneNumber: company.phoneNumber ?? "",
        ownerImageUrl: company.ownerImageUrl ?? "",
        companyImgUrl: company.companyImgUrl ?? "",
      });
    };
    fetchCompany();
  }, [idToken, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dosya seçildiğinde çalışacak fonksiyon, resmi upload edip URL'yi formData'ya koyar
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!idToken) return;
    // TODO: Implement image upload logic here if needed
  };

  const handleSave = async () => {
    if (!idToken) return;
    await updateCompany(idToken, formData);
    alert("Şirket bilgileri güncellendi.");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-4">Şirket Ayarları</h2>

      {/* Normal inputlar */}
      {[
        { key: "name", label: "Şirket Adı" },
        { key: "ownerName", label: "Şirket Sahibi" },
        { key: "companyType", label: "Şirket Türü" },
        { key: "websiteUrl", label: "Web Sitesi URL" },
        { key: "googleUrl", label: "Google URL" },
        { key: "address", label: "Adres" },
        { key: "phoneNumber", label: "Telefon Numarası" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          <input
            name={key}
            value={formData[key as keyof typeof formData] || ""}
            onChange={handleChange}
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>
      ))}

      {/* Resim alanları */}
      {[
        { key: "ownerImageUrl", label: "Şirket Sahibi Resmi" },
        { key: "companyImgUrl", label: "Şirket Resmi" },
      ].map(({ key, label }) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
          {formData[key as keyof typeof formData] && (
            <img
              src={formData[key as keyof typeof formData]}
              alt={label}
              className="mb-2 h-24 object-contain border rounded"
            />
          )}
          <input
            type="file"
            accept="image/*"
            name={key}
            onChange={handleImageChange}
            className="block"
          />
        </div>
      ))}

      <button
        onClick={handleSave}
        className="mt-6 px-6 py-3 bg-brand-green-600 text-white rounded-md hover:bg-brand-green-700 transition"
      >
        Kaydet
      </button>
    </div>
  );
};

export default CompanySettings;
