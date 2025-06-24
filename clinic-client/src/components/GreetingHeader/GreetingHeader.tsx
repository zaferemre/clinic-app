// src/components/GreetingHeader/GreetingHeader.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import { getPatients } from "../../api/patientApi";
import { listGroups } from "../../api/groupApi";
import BackButton from "../Button/BackButton";
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  ArrowLeftStartOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import type { Patient, Group } from "../../types/sharedTypes";
import HomePatientSearchBar from "../HomeSearchBar/HomePatientSearchBar";

// --- Utility for fallback initials
const getInitials = (name?: string) =>
  name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "K";

interface GreetingHeaderProps {
  clinicName: string;
  pageTitle?: string;
  showBackButton?: boolean;
  userAvatarUrl?: string; // Optional override
}

const dropdownVariants: Variants = {
  open: { opacity: 1, y: 0, transition: { stiffness: 300, damping: 24 } },
  closed: { opacity: 0, y: -10, transition: { stiffness: 300, damping: 24 } },
};
const itemVariants: Variants = {
  open: { opacity: 1, y: 0 },
  closed: { opacity: 0, y: -10 },
};

export default function GreetingHeader({
  clinicName,
  pageTitle,
  showBackButton = false,
}: Readonly<GreetingHeaderProps>) {
  const { idToken, selectedCompanyId, selectedClinicId, signOut, user } =
    useAuth();

  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // --- Use avatar from props, or fallback to AuthContext user.photoURL
  const photoURL = user?.photoUrl ?? "";

  // Load patients/groups only if everything is present
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    getPatients(idToken, selectedCompanyId, selectedClinicId)
      .then(setPatients)
      .catch(() => setPatients([]));
    listGroups(idToken, selectedCompanyId, selectedClinicId)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // Dropdown close on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [dropdownOpen]);

  const handleSettings = () => {
    setDropdownOpen(false);
    if (selectedClinicId) navigate(`/clinics/${selectedClinicId}/settings`);
  };
  const handleProfile = () => {
    setDropdownOpen(false);
    navigate(`/clinics/${selectedClinicId}/profile`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

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

      {/* Center Search Bar */}
      <div>
        <HomePatientSearchBar patients={patients} groups={groups} />
      </div>

      {/* Avatar dropdown */}
      {(photoURL || user?.name) && (
        <div ref={avatarRef} className="relative flex-shrink-0 ml-3">
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="group flex items-center focus:outline-none"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <motion.div
              animate={{ rotate: dropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ originY: 0.55 }}
            >
              <ChevronDownIcon className="mr-1 h-5 w-5 text-brand-main-300" />
            </motion.div>
            {photoURL ? (
              <motion.img
                src={photoURL}
                alt={user?.name || "Kullanıcı"}
                className="w-12 h-12 rounded-full border-2 border-brand-main-200 shadow-lg object-cover"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-brand-main-200 shadow-lg bg-brand-main-100 text-brand-main-600 font-bold text-lg">
                {getInitials(user?.name)}
              </div>
            )}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.ul
                initial="closed"
                animate="open"
                exit="closed"
                variants={dropdownVariants}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black/5 z-40 overflow-hidden"
              >
                {/* Profile */}
                <motion.li
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 cursor-pointer"
                  onClick={handleProfile}
                >
                  <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Profilim
                </motion.li>
                {/* Settings */}
                <motion.li
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-3 text-sm text-gray-700 cursor-pointer"
                  onClick={handleSettings}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Ayarlar
                </motion.li>
                {/* Logout */}
                <motion.li
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-4 py-3 text-sm text-red-500 cursor-pointer rounded-b-xl"
                  onClick={handleLogout}
                >
                  <ArrowLeftStartOnRectangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  Çıkış Yap
                </motion.li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </header>
  );
}
