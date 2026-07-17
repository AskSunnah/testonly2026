// src/Components/library/Controls.jsx

export default function Controls({
  currentPage,
  totalPages,
  setCurrentPage,
  fontSize,
  setFontSize,
  isRTL = false,
}) {
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  const navBtnClass = [
    "flex items-center justify-center",
    "w-10 h-10 sm:w-11 sm:h-11",
    "rounded-full",
    "border border-[#ccc]",
    "text-[var(--button-text-color)]",
    "cursor-pointer font-[inherit]",
    "transition-all duration-150",
    "disabled:opacity-30 disabled:cursor-not-allowed",
    "hover:bg-white hover:border-[var(--primary)] hover:text-[var(--text-main)] hover:scale-105",
    "active:scale-95",
    "text-lg",
  ].join(" ");

  const fontBtnClass = [
    "flex items-center justify-center",
    "w-8 h-8 sm:w-9 sm:h-9",
    "rounded-[4px]",
    "border border-[#ccc]",
    "text-[var(--button-text-color)]",
    "cursor-pointer font-[inherit] text-xs sm:text-sm",
    "transition-all duration-150",
    "hover:bg-white hover:border-[var(--primary)] hover:text-[var(--text-main)]",
    "active:scale-95",
  ].join(" ");
  return (
    <div
      dir="ltr"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-main)] border-t border-[var(--border-color)] shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
    >

      {/* Progress bar — golden fill on a light track */}
      <div className="h-2 w-full bg-[var(--border-color)]">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%`, background: "var(--button-gradient)" }}
        />
      </div>

      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 sm:py-3">

        {/* Progress % — physical left, well away from chatbot bubble */}
        <div className="text-[0.65rem] sm:text-xs text-[var(--text-secondary)] min-w-[2rem] tabular-nums select-none">
          {Math.round(progress)}%
        </div>

        {/* Page navigation — center */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => { if (currentPage > 0) setCurrentPage(currentPage - 1); }}
            disabled={currentPage === 0}
            className={navBtnClass}
            style={{ background: "var(--button-gradient)" }}
            title={isRTL ? "الصفحة السابقة" : "Previous page"}
            aria-label={isRTL ? "الصفحة السابقة" : "Previous page"}
          >
            ‹
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage + 1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) - 1;
                if (!isNaN(val) && val >= 0 && val < totalPages) setCurrentPage(val);
              }}
              onKeyDown={(e) => e.stopPropagation()}
              className="w-[38px] sm:w-[50px] px-1 py-1 sm:py-[0.4rem] border border-[#ccc] rounded-[4px] bg-white text-center font-[inherit] text-xs sm:text-sm focus:outline-none focus:border-[var(--primary)]"
            />
            <span className="text-[0.65rem] sm:text-xs text-[var(--text-secondary)] whitespace-nowrap select-none">
              / {totalPages}
            </span>
          </div>

          <button
            onClick={() => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); }}
            disabled={currentPage === totalPages - 1}
            className={navBtnClass}
            style={{ background: "var(--button-gradient)" }}
            title={isRTL ? "الصفحة التالية" : "Next page"}
            aria-label={isRTL ? "الصفحة التالية" : "Next page"}
          >
            ›
          </button>
        </div>

        {/*
          Font size — physical right side.
          pr-16 sm:pr-20 pads the whole group away from the chatbot bubble
          which sits fixed at bottom-right (~56px wide).
        */}
        <div className="flex items-center gap-1.5 pr-16 sm:pr-20">
          <button
            onClick={() => setFontSize((f) => Math.max(0.8, +(f - 0.1).toFixed(1)))}
            className={fontBtnClass}
            style={{ background: "var(--button-gradient)" }}
            title={isRTL ? "تصغير الخط" : "Decrease font size"}
            aria-label={isRTL ? "تصغير الخط" : "Decrease font size"}
          >
            A−
          </button>
          <span className="text-[0.65rem] sm:text-xs text-[var(--text-secondary)] w-6 text-center tabular-nums select-none">
            {Math.round(fontSize * 10)}
          </span>
          <button
            onClick={() => setFontSize((f) => Math.min(2.0, +(f + 0.1).toFixed(1)))}
            className={fontBtnClass}
            style={{ background: "var(--button-gradient)" }}
            title={isRTL ? "تكبير الخط" : "Increase font size"}
            aria-label={isRTL ? "تكبير الخط" : "Increase font size"}
          >
            A+
          </button>
        </div>

      </div>
    </div>
  );
}