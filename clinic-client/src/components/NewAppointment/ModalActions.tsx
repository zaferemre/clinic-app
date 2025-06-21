type ModalActionsProps = Readonly<{
  onClose: () => void;
  creating?: boolean;
  canSubmit: boolean;
}>;

export default function ModalActions({
  onClose,
  creating,
  canSubmit,
}: ModalActionsProps) {
  return (
    <div className="flex justify-end gap-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-lg bg-brand-gray-200 hover:bg-brand-gray-300 text-brand-gray-600 font-semibold transition"
      >
        İptal
      </button>
      <button
        type="submit"
        disabled={!canSubmit || creating}
        className={`
          px-5 py-2 rounded-lg font-semibold text-white transition
          bg-brand-main hover:bg-brand-main/90
          ${!canSubmit || creating ? "opacity-60 cursor-not-allowed" : ""}
        `}
      >
        {creating ? "Kaydediliyor..." : "Oluştur"}
      </button>
    </div>
  );
}
