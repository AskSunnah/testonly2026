// src/Components/library/ChapterList.jsx
const toArabicNumerals = (n) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

export default function ChapterList({
  chapters = [],
  isRTL = false,
  // sidebar mode
  pages,
  currentPage,
  onNavigate,
  // book details mode
  getLinkHref,
}) {
  const isSidebarMode = typeof onNavigate === "function";

  return (
    <nav className="space-y-0.5" dir={isRTL ? "rtl" : "ltr"}>
      {chapters.map((chapter, idx) => {
        const firstPageIdx = Array.isArray(pages)
          ? pages.findIndex((p) => p.chapterIndex === idx)
          : -1;

        const lastPageIdx = Array.isArray(pages)
          ? pages.reduce(
              (last, p, i) => (p.chapterIndex === idx ? i : last),
              -1,
            )
          : -1;

        // Sidebar mode: derive count from flat pages array
        // BookDetails mode: pages prop absent, fall back to chapter.pages.length
        const chapterPageCount =
          firstPageIdx !== -1 && lastPageIdx !== -1
            ? lastPageIdx - firstPageIdx + 1
            : Array.isArray(chapter.pages)
              ? chapter.pages.length
              : 0;

        const isActive =
          isSidebarMode && Array.isArray(pages)
            ? pages[currentPage]?.chapterIndex === idx
            : false;

        const progressWithinChapter =
          isActive && chapterPageCount > 0
            ? ((currentPage - firstPageIdx + 1) / chapterPageCount) * 100
            : 0;

        // Exact same classes as the original Sidebar buttons
        const sharedClass = `
          block w-full no-underline py-[0.5rem] px-2 text-[0.9rem]
          rounded-[4px] transition-colors duration-200
          ${isRTL ? "text-right" : "text-left"}
          ${
            isActive
              ? "text-[var(--text-main)] font-semibold bg-[var(--bg-light)]"
              : "text-[var(--text-accent)] hover:text-[var(--text-main)] hover:bg-[var(--bg-light)]"
          }
        `;

        const inner = (
          <>
            <span className="block leading-snug">{chapter.title}</span>

            {chapterPageCount > 0 && (
              <span className="block text-[0.65rem] text-[var(--text-secondary)] mt-0.5">
                {isRTL
                  ? `${toArabicNumerals(chapterPageCount)} صفحة`
                  : `${chapterPageCount} ${chapterPageCount === 1 ? "page" : "pages"}`}
              </span>
            )}

            {isActive && chapterPageCount > 0 && (
              <div className="mt-1.5 h-[2px] w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                  style={{ width: `${progressWithinChapter}%` }}
                />
              </div>
            )}
          </>
        );

        if (isSidebarMode) {
          return (
            <button
              type="button"
              key={idx}
              onClick={() => {
                if (firstPageIdx !== -1) onNavigate(firstPageIdx);
              }}
              className={`${sharedClass} bg-transparent border-none cursor-pointer`}
            >
              {inner}
            </button>
          );
        }

        const href = getLinkHref ? getLinkHref(chapter, idx) : "#";
        return (
          <a key={idx} href={href} className={sharedClass}>
            {inner}
          </a>
        );
      })}
    </nav>
  );
}
