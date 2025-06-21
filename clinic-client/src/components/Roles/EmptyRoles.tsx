import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";

const EmptyRoles: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow mb-8">
    <UserGroupIcon className="w-16 h-16 text-brand-main mb-4" />
    <div className="text-lg font-semibold text-brand-gray-700 mb-2">
      Henüz hiç rol eklenmemiş.
    </div>
    <div className="text-brand-gray-500 mb-4 px-4">
      Çalışanlarınıza özel yetkiler tanımlamak için bir rol ekleyin.
    </div>
    <button
      onClick={onAdd}
      className="mt-2 bg-brand-main text-white px-5 py-2 rounded-xl shadow font-semibold hover:bg-brand-red-300 transition"
    >
      + Rol Ekle
    </button>
  </div>
);

export default EmptyRoles;
