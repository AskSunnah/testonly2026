import React from "react";
import { X, Check } from "lucide-react";

export default function ConfirmationModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000]">
      <div className="bg-white rounded-xl max-w-[400px] w-[90%] p-6 text-center shadow-[0_8px_20px_rgba(0,0,0,0.2)]">
        <h2 className="m-0 mb-2 text-xl font-semibold">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 hover:bg-red-100 transition-colors"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#c3a421] text-white border-none px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5 hover:bg-[#b0911d] transition-colors"
          >
            <Check size={16} /> Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
