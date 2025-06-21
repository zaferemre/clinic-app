// src/components/FAB/FAB.tsx
import { useState } from "react";
import {
  PlusIcon,
  UserGroupIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

type FloatingActionButtonProps = {
  onAddPatient: () => void;
  onAddGroup: () => void;
};

export const FloatingActionButton = ({
  onAddPatient,
  onAddGroup,
}: FloatingActionButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-6 z-30">
      {/* Overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-20 cursor-default focus:outline-none"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
          tabIndex={0}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            margin: 0,
          }}
        />
      )}

      {/* Buttons */}
      {open && (
        <div className="flex flex-col items-end gap-3 mb-2 z-30">
          <button
            className="flex items-center px-4 py-2 bg-brand-main text-white rounded-full shadow gap-2"
            onClick={() => {
              onAddPatient();
              setOpen(false);
            }}
          >
            <UserPlusIcon className="h-5 w-5" /> Müşteri
          </button>
          <button
            className="flex items-center px-4 py-2 bg-brand-purple text-white rounded-full shadow gap-2"
            onClick={() => {
              onAddGroup();
              setOpen(false);
            }}
          >
            <UserGroupIcon className="h-5 w-5" /> Grup
          </button>
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-16 h-16 bg-brand-main text-white rounded-full shadow-2xl text-2xl hover:scale-105 transition z-30"
        aria-label="Add"
      >
        <PlusIcon className="h-10 w-10" />
      </button>
    </div>
  );
};
