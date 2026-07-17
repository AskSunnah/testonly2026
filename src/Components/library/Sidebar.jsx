// src/Components/library/Sidebar.jsx
import ChapterList from "../../Components/library/ChaptersList";

export default function Sidebar({
  chapters,
  setCurrentPage,
  currentPage,
  pages,
  tocLabel,
  isRTL = false,
}) {
  return (
    <aside dir={isRTL ? "rtl" : "ltr"}>
      <h2 className="text-[1.1rem] text-[var(--text-main)] mb-4 font-semibold">
        {tocLabel}
      </h2>

      <ChapterList
        chapters={chapters}
        isRTL={isRTL}
        pages={pages}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
    </aside>
  );
}