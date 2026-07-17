// src/Components/library/BookDetails.jsx

import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchBook } from "../../api/book";
import ChapterList from "../../Components/library/ChaptersList";

const LANG_MAP = {
  en: {
    dir: "ltr",
    home: "Home",
    library: "Library",
    details: "Book Details",
    index: "Index of Topics",
    aboutAuthor: "About the Author",
    aboutBook: "About the Book",
    book: "Book",
    author: "Author",
    category: "Category",
    language: "Language",
    totalPages: "Total Pages",
    loading: "Loading...",
    error: "Error loading book",
    noAuthorInfo: "No author details have been added yet.",
    noBookInfo: "No detailed book information has been added yet.",
    libraryUrl: "/library",
    categoryNames: {
      Aqeedah: "Aqeedah",
      Fiqh: "Fiqh",
      Hadith: "Hadith",
      Seerah: "Seerah",
    },
    languageNames: { en: "English", ar: "Arabic" },
    birthYear: "Birth Year",
    deathYear: "Death Status",
    unknown: "Unknown",
    living: "Still alive",
  },
  ar: {
    dir: "rtl",
    home: "الرئيسية",
    library: "المكتبة",
    details: "تفاصيل الكتاب",
    index: "فهرس المواضيع",
    aboutAuthor: "عن المؤلف",
    aboutBook: "عن الكتاب",
    book: "الكتاب",
    author: "المؤلف",
    category: "التصنيف",
    language: "اللغة",
    totalPages: "عدد الصفحات",
    loading: "جاري التحميل...",
    error: "تعذر تحميل الكتاب",
    noAuthorInfo: "لم تتم إضافة تفاصيل عن المؤلف بعد.",
    noBookInfo: "لم تتم إضافة تفاصيل عن الكتاب بعد.",
    libraryUrl: "/library_ar",
    categoryNames: {
      Aqeedah: "العقيدة",
      Fiqh: "الفقه",
      Hadith: "الحديث",
      Seerah: "السيرة",
    },
    languageNames: { en: "الإنجليزية", ar: "العربية" },
    birthYear: "سنة الميلاد",
    deathYear: "حالة الوفاة",
    unknown: "غير معروف",
    living: "على قيد الحياة",
  },
};

export default function BookDetails() {
  const { lang = "en", slug } = useParams();
  const labels = LANG_MAP[lang] || LANG_MAP.en;

  const [book, setBook] = useState(null);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState("details");

  useEffect(() => {
    if (!slug) {
      setError(true);
      return;
    }
    fetchBook(lang, slug)
      .then(setBook)
      .catch(() => setError(true));
  }, [lang, slug]);

  const totalPages =
    book?.chapters?.reduce((sum, ch) => sum + (ch.pages?.length || 0), 0) || 0;

  const isRTL = labels.dir === "rtl";
  const displayLanguage =
    labels.languageNames?.[book?.language] || book?.language || "—";
  const displayCategory =
    labels.categoryNames?.[book?.category] || book?.category || "—";
  const displayBirthYear = book?.birthYearUnknown
    ? labels.unknown
    : book?.birthYear || "—";

  const displayDeathYear =
    book?.deathStatus === "living"
      ? labels.living
      : book?.deathStatus === "unknown"
        ? labels.unknown
        : book?.deathYear || "—";

  const sections = [
    { id: "details", title: labels.details },
    { id: "author", title: labels.aboutAuthor },
    { id: "book", title: labels.aboutBook },
  ];

  return (
    <div
      dir={labels.dir}
      className="min-h-screen bg-white text-[#1e293b] font-['Segoe_UI',Tahoma,Geneva,Verdana,sans-serif]"
    >
      {/* Header */}
      <header
        className="text-white px-6 py-10 md:py-14 text-center"
        style={{
          background:
            'linear-gradient(rgba(24,18,5,0.72), rgba(24,18,5,0.72)), url("/books.jpeg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="max-w-[1100px] mx-auto">
          <h1 className="text-[1.7rem] md:text-[2.4rem] font-bold leading-snug">
            {error ? labels.error : book?.title || labels.loading}
          </h1>
        </div>
      </header>

      {/* Navbar */}
      <nav className="bg-[#fffaf0] border-b border-[#e8d99b] px-6 py-4">
        <ul className="list-none m-0 p-0 flex flex-wrap justify-center gap-8">
          <li>
            <Link
              className="text-[#5c4712] font-semibold no-underline hover:text-[#c3a421] transition-colors"
              to="/"
            >
              {labels.home}
            </Link>
          </li>
          <li>
            <Link
              className="text-[#5c4712] font-semibold no-underline hover:text-[#c3a421] transition-colors"
              to={labels.libraryUrl}
            >
              {labels.library}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Main */}
      <main className="max-w-[1050px] mx-auto my-8 md:my-10 px-4">
        {book && !error && (
          <>
            {/* Section toggle cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`rounded-[20px] border px-5 py-5 text-center font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-br from-[#c3a421] to-[#8a6f17] text-white border-[#c3a421]"
                        : "bg-white text-[#5c4712] border-[#eadca3] hover:border-[#c3a421] hover:bg-[#fffdf7]"
                    }`}
                  >
                    <span className="block text-[1rem] md:text-[1.05rem]">
                      {section.title}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* Section content */}
            <section
              className={`bg-white rounded-[24px] border border-[#eadca3] p-6 md:p-8 h-[560px] overflow-y-auto shadow-sm ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {activeSection === "details" && (
                <div>
                  <SectionHeading title={labels.details} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <MetaItem label={labels.book} value={book.title} />
                    <MetaItem
                      label={labels.author}
                      value={book.author || "—"}
                    />
                    <MetaItem
                      label={labels.birthYear}
                      value={displayBirthYear}
                    />
                    <MetaItem
                      label={labels.deathYear}
                      value={displayDeathYear}
                    />
                    <MetaItem label={labels.category} value={displayCategory} />
                    <MetaItem label={labels.language} value={displayLanguage} />
                    <MetaItem label={labels.totalPages} value={totalPages} />
                  </div>

                  {/* Index of Topics — uses the same ChapterList as the reader sidebar */}
                  <div>
                    <h4 className="text-[1.1rem] md:text-[1.2rem] font-bold text-[#5c4712] mb-4">
                      {labels.index}
                    </h4>

                    <ChapterList
                      chapters={book.chapters || []}
                      isRTL={isRTL}
                      getLinkHref={(chapter) => {
                        const firstPage =
                          chapter.pages?.length > 0
                            ? chapter.pages[0].number || 1
                            : 1;
                        return `/library/read/${lang}/${slug}?page=${firstPage}`;
                      }}
                    />
                  </div>
                </div>
              )}

              {activeSection === "author" && (
                <div>
                  <SectionHeading title={labels.aboutAuthor} />
                  <div className="mb-5 rounded-2xl bg-[#fffaf0] border border-[#eadca3] px-5 py-4">
                    <div className="mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <MetaItem
                        label={labels.author}
                        value={book.author || "—"}
                      />
                      <MetaItem
                        label={labels.birthYear}
                        value={displayBirthYear}
                      />
                      <MetaItem
                        label={labels.deathYear}
                        value={displayDeathYear}
                      />
                    </div>
                    <span className="text-[#334155]">{book.author || "—"}</span>
                  </div>
                  <p className="leading-8 whitespace-pre-line text-[#334155]">
                    {book.authorBio?.trim()
                      ? book.authorBio
                      : labels.noAuthorInfo}
                  </p>
                </div>
              )}

              {activeSection === "book" && (
                <div>
                  <SectionHeading title={labels.aboutBook} />
                  <p className="leading-8 whitespace-pre-line text-[#334155]">
                    {book.aboutBook?.trim()
                      ? book.aboutBook
                      : book.description?.trim()
                        ? book.description
                        : labels.noBookInfo}
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {!book && !error && (
          <div className="bg-white border border-[#eadca3] rounded-2xl p-8 text-center text-[#7a5a12] shadow-sm">
            {labels.loading}
          </div>
        )}

        {error && (
          <div className="bg-white border border-[#eadca3] rounded-2xl p-8 text-center text-[#7a5a12] shadow-sm">
            {labels.error}
          </div>
        )}
      </main>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <p className="m-0 rounded-2xl bg-[#fffaf0] border border-[#f0e6bd] px-4 py-3">
      <span className="font-bold text-[#5c4712]">{label}:</span>{" "}
      <span className="text-[#334155]">{value}</span>
    </p>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="mb-6">
      <h3 className="text-[1.35rem] md:text-[1.5rem] font-bold text-[#5c4712]">
        {title}
      </h3>
    </div>
  );
}
