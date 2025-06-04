// src/components/TailwindTest.tsx
import React from "react";

export const TailwindTest: React.FC = () => {
  return (
    <div className="space-y-4 p-4">
      <div className="bg-brand-black text-white p-2 rounded">brand-black</div>
      <div className="bg-brand-gray-100 p-2 rounded">brand-gray-100</div>
      <div className="bg-brand-gray-500 text-white p-2 rounded">
        brand-gray-500
      </div>
      <div className="bg-brand-green-400 text-white p-2 rounded">
        brand-green-400
      </div>
      <div className="bg-warn text-white p-2 rounded">warn (amber)</div>
      <div className="bg-error text-white p-2 rounded">error (red)</div>
      <div className="bg-success text-white p-2 rounded">success (green)</div>
    </div>
  );
};
