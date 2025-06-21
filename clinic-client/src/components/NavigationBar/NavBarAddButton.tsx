// src/components/NavigationBar/NavBarAddButton.tsx
import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

const NavBarAddButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center h-11 rounded-full px-2 text-white"
    aria-label="Ekle"
    type="button"
  >
    <PlusIcon className="h-8 w-8" />
  </button>
);

export default NavBarAddButton;
