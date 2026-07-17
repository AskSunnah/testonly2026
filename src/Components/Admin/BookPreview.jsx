// src/Components/Admin/BookPreview.jsx

import { useState, useEffect, useRef } from "react";
import BookContent from "../library/BookContent";
import Sidebar from "../library/Sidebar";
import ChapterList from "../library/ChaptersList";

// ─── helpers ─────────────────────────────────────────────────────────────────

function buildFlatPages(chapters = []) {
  const flat = [];
  (chapters || []).forEach((chapter, chapterIndex) => {
    (chapter.pages || []).forEach((pg, pageIndex) => {
      flat.push({ ...pg, chapterIndex, pageIndex });
    });
  });
  return flat;
}

// ─── sub-components (mirrors BookDetails.jsx) ────────────────────────────────

function MetaItem({ label, value }) {
  return (
    <p className="m-0 rounded-2xl bg-[#fffaf0] border border-[#f0e6bd] px-4 py-3">
      <span className="font-bold text-[#5c4712]">{label}:</span>{" "}
      <span className="text-[#334155]">{value ?? "—"}</span>
    </p>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="mb-6">
      <h3 className="text-[1.2rem] font-bold text-[#5c4712]">{title}</h3>
    </div>
  );
}

// ─── labels ──────────────────────────────────────────────────────────────────

const LANG_MAP = {
  en: {
    details: "Book Details", aboutAuthor: "About the Author", aboutBook: "About the Book",
    book: "Book", author: "Author", category: "Category", language: "Language",
    totalPages: "Total Pages", index: "Index of Topics",
    noAuthorInfo: "No author details have been added yet.",
    noBookInfo: "No detailed book information has been added yet.",
    categoryNames: { Aqeedah: "Aqeedah", Fiqh: "Fiqh", Hadith: "Hadith", Seerah: "Seerah" },
    languageNames: { en: "English", ar: "Arabic" },
  },
  ar: {
    details: "تفاصيل الكتاب", aboutAuthor: "عن المؤلف", aboutBook: "عن الكتاب",
    book: "الكتاب", author: "المؤلف", category: "التصنيف", language: "اللغة",
    totalPages: "عدد الصفحات", index: "فهرس المواضيع",
    noAuthorInfo: "لم تتم إضافة تفاصيل عن المؤلف بعد.",
    noBookInfo: "لم تتم إضافة تفاصيل عن الكتاب بعد.",
    categoryNames: { Aqeedah: "العقيدة", Fiqh: "الفقه", Hadith: "الحديث", Seerah: "السيرة" },
    languageNames: { en: "الإنجليزية", ar: "العربية" },
  },
};

// ─── main component ───────────────────────────────────────────────────────────

export default function BookPreview({ book, lang = "en" }) {
  const [open, setOpen]                    = useState(false);
  // "reader" | "details"
  const [viewMode, setViewMode]            = useState("reader");
  // reader state
  const [currentPage, setCurrentPage]      = useState(0);
  const [fontSize, setFontSize]            = useState(1.1);
  const [sidebarOpen, setSidebarOpen]      = useState(false);
  const [isTashkeelRemoved, setIsTashkeel] = useState(false);
  // details state
  const [activeSection, setActiveSection]  = useState("details");

  const isArabic   = lang === "ar";
  const labels     = LANG_MAP[isArabic ? "ar" : "en"];
  const flatPages  = buildFlatPages(book?.chapters);
  const totalPages = flatPages.length;
  const hasContent = totalPages > 0;

  const totalPagesCount =
    (book?.chapters || []).reduce((s, ch) => s + (ch.pages?.length || 0), 0);
  const displayCategory =
    labels.categoryNames?.[book?.category] || book?.category || "—";
  const displayLanguage =
    labels.languageNames?.[book?.language] || book?.language || "—";

  // clamp page index
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) setCurrentPage(totalPages - 1);
  }, [totalPages, currentPage]);

  // reset on open
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) { setCurrentPage(0); setViewMode("reader"); setActiveSection("details"); }
    wasOpen.current = open;
  }, [open]);

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const page     = flatPages[currentPage] ?? { blocks: [], references: [] };
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0;

  // button class helpers
  const navBtn = [
    "flex items-center justify-center w-9 h-9 rounded-full",
    "border border-[#ccc] cursor-pointer font-inherit text-lg select-none",
    "transition-all duration-150",
    "disabled:opacity-30 disabled:cursor-not-allowed",
    "hover:border-[#c3a421] hover:scale-105 active:scale-95",
    "bg-gradient-to-b from-[#c3a421] to-[#8a6f17] text-white",
  ].join(" ");

  const fontBtn = [
    "flex items-center justify-center w-8 h-8 rounded-[4px]",
    "border border-[#ccc] cursor-pointer text-xs select-none",
    "transition-all duration-150",
    "hover:border-[#c3a421] active:scale-95",
    "bg-gradient-to-b from-[#c3a421] to-[#8a6f17] text-white",
  ].join(" ");

  // nav labels
  const navHome    = isArabic ? "الرئيسية"      : "Home";
  const navLib     = isArabic ? "المكتبة"       : "Library";
  const navDetails = isArabic ? "تفاصيل الكتاب" : "Book Details";
  const tocLabel   = isArabic ? "فهرس المحتويات": "Table of Contents";
  const sidebarHidden = isArabic ? "max-md:translate-x-full" : "max-md:-translate-x-full";

  // detail sections
  const detailSections = [
    { id: "details", title: labels.details },
    { id: "author",  title: labels.aboutAuthor },
    { id: "book",    title: labels.aboutBook },
  ];

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex-1 flex items-center justify-center gap-2
          border border-[var(--bg-color-header)]
          text-[var(--bg-color-header)] bg-white
          rounded-[10px] py-[13px]
          text-[1.05rem] font-bold
          hover:bg-[rgba(40,115,70,0.05)]
          transition-colors cursor-pointer
        "
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {isArabic ? "معاينة" : "Preview"}
      </button>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/50 p-2 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            dir={isArabic ? "rtl" : "ltr"}
            className="relative flex flex-col w-full max-w-[1320px] max-h-[96vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            {/* ══ Modal header ══ */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8fcf9] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-color-header)] flex items-center justify-center shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="m-0 text-[0.95rem] font-bold text-[var(--bg-color-header)] truncate">
                    {isArabic ? "معاينة الكتاب" : "Book Preview"}
                  </h3>
                  <p className="m-0 text-[0.72rem] text-gray-400">
                    {isArabic
                      ? "مسودة غير محفوظة — هكذا سيظهر للقراء"
                      : "Unsaved draft — this is how it will appear to readers"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* View mode toggle */}
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[0.78rem] font-semibold">
                  <button
                    type="button"
                    onClick={() => setViewMode("reader")}
                    className={`px-3 py-1.5 transition-colors cursor-pointer border-none ${
                      viewMode === "reader"
                        ? "bg-[var(--bg-color-header)] text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {isArabic ? "القارئ" : "Reader"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("details")}
                    className={`px-3 py-1.5 transition-colors cursor-pointer border-none border-l border-gray-200 ${
                      viewMode === "details"
                        ? "bg-[var(--bg-color-header)] text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {isArabic ? "تفاصيل الكتاب" : "Book Details"}
                  </button>
                </div>

                {/* Language badge */}
                <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  isArabic ? "bg-purple-100 text-purple-700" : "bg-sky-100 text-sky-700"
                }`}>
                  {isArabic ? "Arabic" : "English"}
                </span>

                {/* Tashkeel — only in reader mode, Arabic only */}
                {isArabic && viewMode === "reader" && (
                  <button
                    type="button"
                    onClick={() => setIsTashkeel((p) => !p)}
                    className="text-[0.75rem] px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {isTashkeelRemoved ? "استعادة التشكيل" : "إزالة التشكيل"}
                  </button>
                )}

                {/* Close */}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                  aria-label="Close preview"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  {isArabic ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>

            {/* ══ Fake navbar ══ */}
            <nav className="shrink-0 bg-[#fffaf0] px-6 py-3 border-b border-[#e8d99b] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]">
              <ul className="list-none m-0 p-0 flex flex-wrap justify-center gap-6">
                {[navHome, navLib, navDetails].map((label, i) => (
                  <li key={i}>
                    <span className={`text-sm font-semibold cursor-default ${
                      i === 2 ? "text-[var(--bg-color-header,#287346)]" : "text-[#5c4712] opacity-40"
                    }`}>
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ══ VIEW: READER ══ */}
            {viewMode === "reader" && (
              <>
                <div className="flex flex-row flex-1 min-h-0 overflow-hidden">

                  {/* Sidebar */}
                  <div className={`
                    shrink-0 bg-[var(--bg-main,#fffaf0)]
                    border-e border-[var(--border-color,#e8d99b)] overflow-y-auto
                    w-[22%] min-w-[160px]
                    max-md:fixed max-md:inset-y-0 max-md:start-0
                    max-md:w-[75vw] max-md:max-w-[280px]
                    max-md:z-50 max-md:shadow-xl
                    max-md:transition-transform max-md:duration-300
                    ${sidebarOpen ? "max-md:translate-x-0" : sidebarHidden}
                  `}>
                    <div className="p-4 max-md:pt-14">
                      <Sidebar
                        open={sidebarOpen}
                        chapters={book?.chapters || []}
                        setCurrentPage={(p) => { setCurrentPage(p); setSidebarOpen(false); }}
                        currentPage={currentPage}
                        pages={flatPages}
                        tocLabel={tocLabel}
                        isRTL={isArabic}
                      />
                    </div>
                  </div>

                  {sidebarOpen && (
                    <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
                  )}

                  <main className="flex-1 min-w-0 overflow-y-auto pb-4">
                    {/* Mobile TOC toggle */}
                    <button
                      type="button"
                      className="md:hidden flex items-center gap-2 text-[0.85rem] text-[var(--primary,#c3a421)] bg-transparent border-none cursor-pointer px-4 py-2"
                      onClick={() => setSidebarOpen((o) => !o)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="12" x2="15" y2="12" />
                        <line x1="3" y1="18" x2="18" y2="18" />
                      </svg>
                      {sidebarOpen ? (isArabic ? "إخفاء الفهرس" : "Hide Contents") : (isArabic ? "عرض الفهرس" : "Contents")}
                    </button>

                    {!hasContent && (
                      <div className="flex flex-col items-center justify-center h-full py-20 text-[#7a5a12] opacity-60 gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 opacity-40"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-sm font-medium text-center px-6">
                          {isArabic
                            ? "لا توجد صفحات بعد — أضف فصلاً وصفحات لرؤية المعاينة."
                            : "No pages yet — add chapters and pages to see the preview."}
                        </p>
                      </div>
                    )}

                    {hasContent && (
                      <div className="px-3 pt-2 pb-2">
                        <style>{`.bk-preview-body > div { width: 100% !important; max-width: 100% !important; }`}</style>
                        <div className="bk-preview-body">
                          <BookContent
                            blocks={page.blocks || []}
                            references={page.references || []}
                            fontSize={fontSize}
                            removeTashkeel={isTashkeelRemoved}
                            lang={lang}
                          />
                        </div>
                      </div>
                    )}
                  </main>
                </div>

                {/* Controls bar */}
                <div className="shrink-0 bg-[var(--bg-main,#fffaf0)] border-t border-[var(--border-color,#e8d99b)]" dir="ltr">
                  <div className="h-1.5 w-full bg-[var(--border-color,#e8d99b)]">
                    <div className="h-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%`, background: "linear-gradient(to right,#c3a421,#8a6f17)" }} />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-4 py-2">
                    <span className="text-[0.65rem] text-[#7a5a12] min-w-[2.5rem] tabular-nums select-none">
                      {Math.round(progress)}%
                    </span>
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                        disabled={currentPage === 0 || !hasContent}
                        className={navBtn}
                        title={isArabic ? "الصفحة السابقة" : "Previous page"}>‹</button>
                      <div className="flex items-center gap-1">
                        <input type="number" min={1} max={totalPages || 1}
                          value={hasContent ? currentPage + 1 : 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10) - 1;
                            if (!isNaN(v) && v >= 0 && v < totalPages) setCurrentPage(v);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          className="w-10 px-1 py-1 border border-[#ccc] rounded-[4px] bg-white text-center text-xs focus:outline-none focus:border-[#c3a421]"
                        />
                        <span className="text-[0.65rem] text-[#7a5a12] select-none whitespace-nowrap">/ {totalPages || 0}</span>
                      </div>
                      <button type="button"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={currentPage >= totalPages - 1 || !hasContent}
                        className={navBtn}
                        title={isArabic ? "الصفحة التالية" : "Next page"}>›</button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => setFontSize((f) => Math.max(0.8, +(f - 0.1).toFixed(1)))} className={fontBtn}>A−</button>
                      <span className="text-[0.65rem] text-[#7a5a12] w-6 text-center tabular-nums select-none">{Math.round(fontSize * 10)}</span>
                      <button type="button" onClick={() => setFontSize((f) => Math.min(2.0, +(f + 0.1).toFixed(1)))} className={fontBtn}>A+</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══ VIEW: BOOK DETAILS — mirrors BookDetails.jsx exactly ══ */}
            {viewMode === "details" && (
              <div className="flex-1 min-h-0 overflow-y-auto bg-white">
                {/* Hero header — same as BookDetails */}
                <header
                  className="text-white px-6 py-8 text-center"
                  style={{
                    background: 'linear-gradient(rgba(24,18,5,0.72),rgba(24,18,5,0.72)),url("/books.jpeg")',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <h1 className="text-[1.4rem] md:text-[2rem] font-bold leading-snug m-0">
                    {book?.title || (isArabic ? "بدون عنوان" : "Untitled")}
                  </h1>
                </header>

                <div className={`max-w-[1050px] mx-auto my-6 px-4 ${isArabic ? "text-right" : "text-left"}`}>
                  {/* Section toggle cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {detailSections.map((section) => {
                      const isActive = activeSection === section.id;
                      return (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => setActiveSection(section.id)}
                          className={`rounded-[20px] border px-5 py-5 text-center font-bold transition-all duration-300 cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-br from-[#c3a421] to-[#8a6f17] text-white border-[#c3a421]"
                              : "bg-white text-[#5c4712] border-[#eadca3] hover:border-[#c3a421] hover:bg-[#fffdf7]"
                          }`}
                        >
                          {section.title}
                        </button>
                      );
                    })}
                  </div>

                  {/* Section content panel */}
                  <div className="bg-white rounded-[24px] border border-[#eadca3] p-6 md:p-8 shadow-sm">

                    {activeSection === "details" && (
                      <div>
                        <SectionHeading title={labels.details} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                          <MetaItem label={labels.book}       value={book?.title} />
                          <MetaItem label={labels.author}     value={book?.author} />
                          <MetaItem label={labels.category}   value={displayCategory} />
                          <MetaItem label={labels.language}   value={displayLanguage} />
                          <MetaItem label={labels.totalPages} value={totalPagesCount} />
                        </div>
                        <div>
                          <h4 className="text-[1rem] md:text-[1.1rem] font-bold text-[#5c4712] mb-4">
                            {labels.index}
                          </h4>
                          {/* ChapterList in book-details mode: links are disabled in preview */}
                          <ChapterList
                            chapters={book?.chapters || []}
                            isRTL={isArabic}
                            getLinkHref={() => "#"}
                          />
                        </div>
                      </div>
                    )}

                    {activeSection === "author" && (
                      <div>
                        <SectionHeading title={labels.aboutAuthor} />
                        <div className="mb-5 rounded-2xl bg-[#fffaf0] border border-[#eadca3] px-5 py-4">
                          <span className="font-bold text-[#5c4712]">{labels.author}:</span>{" "}
                          <span className="text-[#334155]">{book?.author || "—"}</span>
                        </div>
                        <p className="leading-8 whitespace-pre-line text-[#334155]">
                          {book?.authorBio?.trim() ? book.authorBio : labels.noAuthorInfo}
                        </p>
                      </div>
                    )}

                    {activeSection === "book" && (
                      <div>
                        <SectionHeading title={labels.aboutBook} />
                        <p className="leading-8 whitespace-pre-line text-[#334155]">
                          {book?.aboutBook?.trim()
                            ? book.aboutBook
                            : book?.description?.trim()
                            ? book.description
                            : labels.noBookInfo}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ Modal footer ══ */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-[#f8fcf9] flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-400 m-0 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {isArabic
                  ? "روابط التنقل معطّلة في وضع المعاينة"
                  : "Navigation links are disabled in preview mode"}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {isArabic ? "إغلاق المعاينة" : "Close preview"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}