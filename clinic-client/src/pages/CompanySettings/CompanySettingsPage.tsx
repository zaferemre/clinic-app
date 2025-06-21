import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../../api/companyApi";
import { useNavigate } from "react-router-dom";
import CompanySettingsHeader from "../../components/CompanySettings/CompanySettingsHeader";
import CompanySettingsForm from "../../components/CompanySettings/CompanySettingsForm";
import CompanyDeleteSection from "../../components/CompanySettings/CompanyDeleteSection";
import { Company } from "../../types/sharedTypes";

export default function CompanySettingsPage() {
  const { idToken, selectedCompanyId, signOut } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // --- FORM STATE ---
  const [form, setForm] = useState({
    name: "",
    websiteUrl: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    allowPublicBooking: false,
    inactivityThreshold: 90,
  });

  // --- LOAD COMPANY DATA ---
  useEffect(() => {
    if (!idToken || !selectedCompanyId) return;
    getCompanyById(idToken, selectedCompanyId)
      .then(setCompany)
      .catch(() => setError("Şirket bilgileri alınamadı."));
  }, [idToken, selectedCompanyId]);

  // --- SET FORM WHEN COMPANY CHANGES ---
  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name ?? "",
      websiteUrl: company.websiteUrl ?? "",
      instagram: company.socialLinks?.instagram ?? "",
      facebook: company.socialLinks?.facebook ?? "",
      whatsapp: company.socialLinks?.whatsapp ?? "",
      allowPublicBooking: company.settings?.allowPublicBooking ?? false,
      inactivityThreshold: company.settings?.inactivityThresholdDays ?? 90,
    });
  }, [company]);

  // --- INPUT HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckbox = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      allowPublicBooking: checked,
    }));
  };

  // --- SAVE COMPANY ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !selectedCompanyId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCompany(idToken, selectedCompanyId, {
        name: form.name,
        websiteUrl: form.websiteUrl,
        socialLinks: {
          instagram: form.instagram,
          facebook: form.facebook,
          whatsapp: form.whatsapp,
        },
        settings: {
          allowPublicBooking: form.allowPublicBooking,
          inactivityThresholdDays: Number(form.inactivityThreshold),
        },
      });
      setSuccess("Şirket ayarları kaydedildi!");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Kaydedilemedi.");
      }
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE COMPANY ---
  const handleDeleteCompany = async () => {
    if (!idToken || !selectedCompanyId) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCompany(idToken, selectedCompanyId);
      setSuccess("Şirket silindi. Oturumunuz kapatılıyor...");
      setTimeout(() => {
        signOut();
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Şirket silinemedi.");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start pt-12 pb-6 px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-2">
        <CompanySettingsHeader />
        <p className="text-gray-600 mb-5">
          Şirketinize ait bilgileri ve genel ayarları burada
          güncelleyebilirsiniz.
        </p>
        <CompanySettingsForm
          form={form}
          saving={saving}
          error={error}
          success={success}
          onChange={handleChange}
          onCheckbox={handleCheckbox}
          onSubmit={handleSave}
        />
        <CompanyDeleteSection
          show={showDeleteConfirm}
          deleting={deleting}
          onRequest={() => setShowDeleteConfirm(true)}
          onConfirm={handleDeleteCompany}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
}
