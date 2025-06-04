// src/components/Header.tsx
import React, { useState, useEffect } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  clinicName: string;
}

export const Header: React.FC<HeaderProps> = ({ clinicName }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY + 5) {
        // scrolling down
        setHidden(true);
      } else if (currentScrollY < lastScrollY - 5) {
        // scrolling up
        setHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <Disclosure
      as="header"
      className={`fixed top-0 left-0 right-0 z-20 bg-white h-12 transition-transform duration-200 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {({ open }) => (
        <>
          <div className="flex items-center justify-between px-4 h-full">
            {/* Clinic Name (clickable) */}
            <div
              onClick={() => {
                if (location.pathname !== "/") {
                  navigate("/");
                }
              }}
              className="cursor-pointer"
            >
              <h1 className="text-lg font-semibold text-brand-black leading-tight">
                {clinicName}
              </h1>
            </div>

            {/* Hamburger Menu (mobile) */}
            <div className="md:hidden">
              <DisclosureButton className="inline-flex items-center justify-center rounded-md p-1 text-brand-gray-700 hover:text-brand-black focus:outline-none">
                <span className="sr-only">Open menu</span>
                {open ? (
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-5 w-5" aria-hidden="true" />
                )}
              </DisclosureButton>
            </div>

            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-green-500 text-sm font-medium"
                    : "text-brand-gray-700 text-sm hover:text-brand-black"
                }
              >
                Ana Sayfa
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-green-500 text-sm font-medium"
                    : "text-brand-gray-700 text-sm hover:text-brand-black"
                }
              >
                Takvim
              </NavLink>
              <NavLink
                to="/patients"
                className={({ isActive }) =>
                  isActive
                    ? "text-brand-green-500 text-sm font-medium"
                    : "text-brand-gray-700 text-sm hover:text-brand-black"
                }
              >
                Hastalar
              </NavLink>
              <button
                onClick={() => {
                  signOut();
                  navigate("/login", { replace: true });
                }}
                className="text-brand-gray-700 text-sm hover:text-brand-black font-medium"
              >
                Çıkış Yap
              </button>
            </div>
          </div>

          {/* Mobile dropdown panel */}
          <DisclosurePanel className="md:hidden border-t border-brand-gray-200">
            <div className="px-4 pt-2 pb-1 space-y-1 text-sm">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block px-3 py-1 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Ana Sayfa
              </NavLink>
              <NavLink
                to="/calendar"
                className={({ isActive }) =>
                  `block px-3 py-1 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Takvim
              </NavLink>
              <NavLink
                to="/patients"
                className={({ isActive }) =>
                  `block px-3 py-1 rounded-md ${
                    isActive
                      ? "bg-brand-gray-100 text-brand-black"
                      : "text-brand-gray-700 hover:bg-brand-gray-50 hover:text-brand-black"
                  }`
                }
              >
                Hastalar
              </NavLink>
              <button
                onClick={() => {
                  signOut();
                  navigate("/login", { replace: true });
                }}
                className="w-full text-left block px-3 py-1 rounded-md text-error hover:bg-error/10"
              >
                Çıkış Yap
              </button>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};
