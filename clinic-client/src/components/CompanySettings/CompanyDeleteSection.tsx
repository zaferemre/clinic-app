import React from "react";
import { AiFillDelete } from "react-icons/ai";

interface Props {
  show: boolean;
  deleting: boolean;
  onRequest: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const CompanyDeleteSection: React.FC<Props> = ({
  show,
  deleting,
  onRequest,
  onConfirm,
  onCancel,
}) => (
  <>
    <div className="mt-10 border-t pt-6">
      <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
        <AiFillDelete className="text-red-500 text-xl" />
        Şirketi Sil
      </h3>
      <p className="text-xs text-gray-600 mb-3">
        Bu işlemi geri alamazsınız! Tüm şirket verileri ve klinikler silinecek.
      </p>
      <button
        onClick={onRequest}
        className="flex items-center gap-2 px-5 py-2 rounded bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
        disabled={deleting}
      >
        <AiFillDelete className="text-white text-lg" />
        {deleting ? "Siliniyor..." : "Şirketi Sil"}
      </button>
    </div>
    {show && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-xs w-full flex flex-col items-center">
          <AiFillDelete className="text-4xl text-red-500 mb-2" />
          <p className="text-red-700 font-bold mb-3">
            Emin misiniz? Bu işlem geri alınamaz!
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button
              className="flex-1 py-2 rounded bg-gray-200 font-semibold hover:bg-gray-300 transition"
              onClick={onCancel}
              disabled={deleting}
            >
              Vazgeç
            </button>
            <button
              className="flex-1 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              onClick={onConfirm}
              disabled={deleting}
            >
              Evet, Sil
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default CompanyDeleteSection;
