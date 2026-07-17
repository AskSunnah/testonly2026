// src/pages/EditBook.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchBookAdmin,
  saveBookAdmin,
  fetchAuthors,
  reassignBookAuthor,
} from "../../api/adminBook";
import BookEditor from "../../Components/Admin/BookEditor";
import AdminLayout from "../../Components/Admin/AdminLayout";
import AuthorManager from "../../Components/Admin/AuthorManagement";
import BookPreview from "../../Components/Admin/BookPreview";

const CATEGORIES = [
  { value: "", label: "-- Select Category --" },
  { value: "Aqeedah", label: "Aqeedah Books" },
  { value: "Fiqh", label: "Fiqh" },
  { value: "Hadith", label: "Hadith" },
  { value: "Seerah", label: "Seerah" },
];

const LANGS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

export default function EditBook() {
  const { lang, slug } = useParams();

  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [modal, setModal] = useState({ show: false, title: "", message: "" });

  useEffect(() => {
    fetchBookAdmin(lang, slug)
      .then((b) => {
        setBook({
          ...b,
          authorId: b.authorId ? String(b.authorId) : "",
        });
      })
      .catch((err) =>
        setModal({ show: true, title: "Error", message: err.message }),
      );
  }, [lang, slug]);

  useEffect(() => {
    if (!book?.language) return;
    fetchAuthors(book.language)
      .then(setAuthors)
      .catch(() => setAuthors([]));
  }, [book?.language]);

  if (!book) {
    return (
      <AdminLayout>
        <div className="w-full max-w-[850px] mx-auto mt-8 font-[Segoe_UI,sans-serif]">
          <div className="bg-white p-8 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-center">
            Loading...
          </div>
        </div>
      </AdminLayout>
    );
  }

  const isArabic = book.language === "ar";

  const contentDirectionProps = isArabic
    ? { dir: "rtl", lang: "ar", style: { unicodeBidi: "plaintext" } }
    : { dir: "ltr", lang: "en", style: { unicodeBidi: "plaintext" } };

  const fieldCls =
    "block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border";
  const labelCls = "font-bold mt-4 block text-[var(--bg-color-header)]";
  const contentFieldCls = `${fieldCls} ${isArabic ? "text-right leading-8" : "text-left"}`;
  const slugFieldCls = `${fieldCls} text-left`;
  const selectFieldCls = `${fieldCls} ${isArabic ? "text-right" : "text-left"}`;
  const disabledFieldCls =
    "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed";

  const handleFieldChange = (field, value) => {
    if (field === "language") {
      setBook({
        ...book,
        language: value,
        authorId: "",
        author: "",
        authorBio: "",
        birthYear: null,
        birthYearUnknown: false,
        deathYear: null,
        deathStatus: "unknown",
      });
      return;
    }
    setBook({ ...book, [field]: value });
  };

  const handleAuthorChange = (author) => {
    if (!author) {
      setBook((b) => ({
        ...b,
        authorId: "",
        author: "",
        authorBio: "",
        birthYear: null,
        birthYearUnknown: false,
        deathYear: null,
        deathStatus: "unknown",
      }));
      return;
    }

    const authorId = String(author._id || author.id || "");

    setBook((b) => ({
      ...b,
      authorId,
      author: author.name,
      authorBio: author.bio || "",
      birthYear: author.birthYear ?? null,
      birthYearUnknown: !!author.birthYearUnknown,
      deathYear: author.deathYear ?? null,
      deathStatus: author.deathStatus || "unknown",
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (
      !["known", "unknown", "living"].includes(book.deathStatus || "unknown")
    ) {
      setModal({
        show: true,
        title: "Invalid Death Status",
        message: "Please select a valid death status.",
      });
      return;
    }
    if (book.deathStatus === "known" && !book.deathYear) {
      setModal({
        show: true,
        title: "Missing Death Year",
        message: "Death year is required when death status is known.",
      });
      return;
    }
    if (
      book.deathStatus === "known" &&
      book.birthYear &&
      book.deathYear &&
      Number(book.deathYear) < Number(book.birthYear)
    ) {
      setModal({
        show: true,
        title: "Invalid Years",
        message: "Death year cannot be before birth year.",
      });
      return;
    }

    try {
      await saveBookAdmin(lang, slug, book);
      await reassignBookAuthor(lang, slug, book.authorId || null);
      setModal({
        show: true,
        title: "Success",
        message: "Book saved successfully!",
      });
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: "Save failed: " + err.message,
      });
    }
  };

  const closeModal = () => setModal({ ...modal, show: false });

  return (
    <AdminLayout>
      <div className="w-full max-w-[850px] flex flex-col items-center mx-auto font-[Segoe_UI,sans-serif]">
        <h1 className="text-[2rem] mb-6 text-center text-[var(--bg-color-header)]">
          Edit Book
        </h1>

        <form
          onSubmit={handleSave}
          className="bg-white p-8 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full"
        >
          <label className={labelCls}>Title:</label>
          <input
            {...contentDirectionProps}
            className={contentFieldCls}
            value={book.title || ""}
            onChange={(e) => handleFieldChange("title", e.target.value)}
            required
          />

          <label className={labelCls}>Slug:</label>
          <input
            dir="ltr"
            lang="en"
            className={slugFieldCls}
            value={book.slug || ""}
            onChange={(e) => handleFieldChange("slug", e.target.value)}
            required
          />

          <label className={labelCls}>Language:</label>
          <select
            className={fieldCls}
            value={book.language || "en"}
            onChange={(e) => handleFieldChange("language", e.target.value)}
            required
            dir="ltr"
            lang="en"
          >
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Author section — reassign + edit only, no create */}
          <AuthorManager
            authors={authors}
            setAuthors={setAuthors}
            selectedAuthorId={book.authorId}
            language={book.language}
            onSelect={handleAuthorChange}
            onError={(message) =>
              setModal({ show: true, title: "Error", message })
            }
            onSuccess={(message) =>
              setModal({ show: true, title: "Success", message })
            }
            contentDirectionProps={contentDirectionProps}
            fieldCls={fieldCls}
            labelCls={labelCls}
            selectFieldCls={selectFieldCls}
            allowCreate={false}
          />

          {/* Read-only author name display */}
          <label className={labelCls}>Author Name:</label>
          <input
            {...contentDirectionProps}
            className={`${contentFieldCls} ${disabledFieldCls}`}
            value={book.author || ""}
            disabled
          />

          <label className={labelCls}>About the Author:</label>
          <textarea
            {...contentDirectionProps}
            className={`${contentFieldCls} ${disabledFieldCls}`}
            value={book.authorBio || ""}
            disabled
            placeholder="Populated from saved author"
          />

          <label className={labelCls}>Birth Year:</label>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="number"
              className={`flex-1 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border ${disabledFieldCls}`}
              value={book.birthYear ?? ""}
              disabled
            />
            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
              <input
                type="checkbox"
                checked={!!book.birthYearUnknown}
                disabled
                readOnly
              />
              Unknown
            </label>
          </div>

          <label className={labelCls}>Death Status:</label>
          <div className="flex flex-wrap gap-4 mb-4">
            {[
              { value: "known", label: "Death year known" },
              { value: "unknown", label: "Death year unknown" },
              { value: "living", label: "Still alive" },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="deathStatus"
                  checked={book.deathStatus === value}
                  disabled
                  readOnly
                />
                {label}
              </label>
            ))}
          </div>

          {book.deathStatus === "known" && (
            <>
              <label className={labelCls}>Death Year:</label>
              <input
                type="number"
                className={`block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border ${disabledFieldCls}`}
                value={book.deathYear ?? ""}
                disabled
              />
            </>
          )}

          <label className={labelCls}>Description:</label>
          <textarea
            {...contentDirectionProps}
            className={contentFieldCls}
            value={book.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
          />

          <label className={labelCls}>About the Book:</label>
          <textarea
            {...contentDirectionProps}
            className={contentFieldCls}
            value={book.aboutBook || ""}
            onChange={(e) => handleFieldChange("aboutBook", e.target.value)}
            placeholder="Write detailed information about this book"
          />

          <label className={labelCls}>Category:</label>
          <select
            className={fieldCls}
            value={book.category || ""}
            onChange={(e) => handleFieldChange("category", e.target.value)}
            required
            dir="ltr"
            lang="en"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          <BookEditor
            book={book}
            onChange={setBook}
            isArabic={isArabic}
            contentDirectionProps={contentDirectionProps}
          />

          <div className="mt-6 flex justify-center">
            <BookPreview book={book} lang={book.language} />
          </div>

          <button
            type="submit"
            className="bg-[var(--bg-color-header)] text-white border-none py-[0.7rem] px-[1.4rem] rounded-lg text-base font-bold cursor-pointer mt-6 w-full block transition-colors duration-300 hover:bg-[#1f5c38]"
          >
            Save Book
          </button>
        </form>
      </div>

      {modal.show && (
        <div className="block fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-4 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[9999] w-[90%] max-w-[600px] text-center text-base">
          <strong className="block text-[1.2rem] mb-2">{modal.title}</strong>
          <span>{modal.message}</span>
          <br />
          <br />
          <button
            type="button"
            onClick={closeModal}
            className="bg-[#287346] text-white border-none py-2 px-4 font-bold rounded-[6px] cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
