import { useLocation, useNavigate } from "react-router-dom";
import { Flag, ArrowLeft } from "lucide-react";

export default function ReportedTextBanner({ lang, pageNumber }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.reportedText) return null;

  const isRTL = lang === "ar";

  return (
    <div className="w-full mb-5 rounded-xl border border-amber-300 bg-amber-50 p-5 text-left">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
          <Flag size={14} />
          Reported text{pageNumber ? ` — Page ${pageNumber}` : ""}
        </div>
        <button
          type="button"
          onClick={() => navigate("/reports")}
          className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 bg-white cursor-pointer flex items-center gap-1"
        >
          <ArrowLeft size={12} />
          Back to reports
        </button>
      </div>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        className={`text-[0.95rem] leading-relaxed text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto ${isRTL ? "text-right" : "text-left"}`}
      >
        {state.reportedText}
      </div>
    </div>
  );
}