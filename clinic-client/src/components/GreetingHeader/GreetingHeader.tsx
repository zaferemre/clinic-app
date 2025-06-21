// src/components/GreetingHeader/GreetingHeader.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getPatients } from "../../api/patientApi";
import { listGroups } from "../../api/groupApi";
import BackButton from "../Button/BackButton";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import HomePatientSearchBar from "../HomeSearchBar/HomePatientSearchBar";
import type { Patient, Group } from "../../types/sharedTypes";

interface GreetingHeaderProps {
  clinicName: string;
  pageTitle?: string;
  showBackButton?: boolean;
  userAvatarUrl?: string;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  clinicName,
  pageTitle,
  showBackButton = false,
  userAvatarUrl,
}) => {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Fetch patients & groups when we have everything we need
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;

    getPatients(idToken, selectedCompanyId, selectedClinicId)
      .then((res) => setPatients(res))
      .catch((err) => console.error("Error loading patients:", err));

    listGroups(idToken, selectedCompanyId, selectedClinicId)
      .then((res) => setGroups(res))
      .catch((err) => console.error("Error loading groups:", err));
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // Close avatar dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!avatarRef.current?.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header className="flex items-center justify-between w-full py-2 sm:px-4">
      <div className="flex items-center flex-1 min-w-0">
        {showBackButton && (
          <div className="mr-3 flex-shrink-0">
            <BackButton />
          </div>
        )}
        <nav
          className="flex items-center gap-1 min-w-0 text-ellipsis overflow-hidden"
          aria-label="Breadcrumb"
        >
          <span className="text-sm text-brand-main-400 font-medium truncate max-w-[88px]">
            {clinicName}
          </span>
          {pageTitle && (
            <>
              <span className="text-sm text-brand-main-200 font-bold">›</span>
              <span className="text-sm text-gray-400 font-medium truncate max-w-[120px]">
                {pageTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Now our search bar gets real data */}
      <div>
        <HomePatientSearchBar patients={patients} groups={groups} />
      </div>

      {/* Avatar + dropdown */}
      {userAvatarUrl && (
        <div ref={avatarRef} className="relative flex-shrink-0 ml-3">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="group flex items-center focus:outline-none"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <ChevronDownIcon
              className={`mr-1 h-5 w-5 text-brand-main-300 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              aria-hidden="true"
            />
            <img
              src={userAvatarUrl}
              alt="Kullanıcı"
              className="w-12 h-12 rounded-full border-2 border-brand-main-200 shadow-lg object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-40 animate-fade-in">
              <ul className="py-1 text-sm text-gray-700">
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-t-xl"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profilim
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Ayarlar
                  </button>
                </li>
                <li>
                  <button
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-b-xl"
                    onClick={() => {
                      setDropdownOpen(false);
                      // TODO: logout handler
                    }}
                  >
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default GreetingHeader;
