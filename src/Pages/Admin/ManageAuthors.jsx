import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../Components/Admin/AdminLayout";
import {
  fetchAuthors,
  createAuthor,
  updateAuthor,
  fetchAuthorBooks,
  deleteAuthor,
} from "../../api/adminBook";

const BLANK_AUTHOR = {
  name: "",
  bio: "",
  birthYear: null,
  birthYearUnknown: false,
  deathYear: null,
  deathStatus: "unknown",
};
function YearFields({ value, onChange, labelCls }) {
  return (
    <>
      <label className={labelCls}>Birth Year:</label>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          className="flex-1 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
          value={value.birthYear ?? ""}
          onChange={(e) =>
            onChange({
              ...value,
              birthYear: e.target.value ? Number(e.target.value) : null,
            })
          }
          disabled={!!value.birthYearUnknown}
          placeholder="e.g. 1263"
        />

        <label className="flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!value.birthYearUnknown}
            onChange={(e) =>
              onChange({
                ...value,
                birthYearUnknown: e.target.checked,
                birthYear: e.target.checked ? null : value.birthYear,
              })
            }
          />
          Unknown
        </label>
      </div>
      <label className={labelCls}>Death Status:</label>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="deathStatus"
            checked={value.deathStatus === "known"}
            onChange={() =>
              onChange({
                ...value,
                deathStatus: "known",
              })
            }
          />
          Death year known
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="deathStatus"
            checked={value.deathStatus === "unknown"}
            onChange={() =>
              onChange({
                ...value,
                deathStatus: "unknown",
                deathYear: null,
              })
            }
          />
          Death year unknown
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name="deathStatus"
            checked={value.deathStatus === "living"}
            onChange={() =>
              onChange({
                ...value,
                deathStatus: "living",
                deathYear: null,
              })
            }
          />
          Still alive
        </label>
      </div>

      {value.deathStatus === "known" && (
        <>
          <label className={labelCls}>Death Year:</label>
          <input
            type="number"
            className="block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
            value={value.deathYear ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                deathYear: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="e.g. 1328"
          />
        </>
      )}
    </>
  );
}
export default function ManageAuthors() {
  const [language, setLanguage] = useState("en");
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [form, setForm] = useState(BLANK_AUTHOR);

  const [deleteFlow, setDeleteFlow] = useState({
    show: false,
    author: null,
    linkedBooks: [],
    reassignMap: {},
  });

  const isArabic = language === "ar";

  const contentDirectionProps = isArabic
    ? { dir: "rtl", lang: "ar", style: { unicodeBidi: "plaintext" } }
    : { dir: "ltr", lang: "en", style: { unicodeBidi: "plaintext" } };

  const fieldCls =
    "block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border outline-none focus:border-[#c3a421]";

  const labelCls = "font-bold mt-4 block text-[var(--bg-color-header)]";

  const contentFieldCls = `${fieldCls} ${
    isArabic ? "text-right leading-8" : "text-left"
  }`;

  const loadAuthors = async () => {
    setLoading(true);
    try {
      const data = await fetchAuthors(language);
      setAuthors(data);
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message || "Failed to load authors.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuthors();
    setSearch("");
    setFormOpen(false);
    setEditingAuthor(null);
    setDeleteFlow({
      show: false,
      author: null,
      linkedBooks: [],
      reassignMap: {},
    });
  }, [language]);

  const filteredAuthors = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return authors;

    return authors.filter((author) =>
      [author.name, author.bio]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [authors, search]);

  const openAddForm = () => {
    setEditingAuthor(null);
    setForm(BLANK_AUTHOR);
    setFormOpen(true);
  };

  const openEditForm = (author) => {
    setEditingAuthor(author);
    setForm({
      name: author.name || "",
      bio: author.bio || "",
      birthYear: author.birthYear ?? null,
      birthYearUnknown: !!author.birthYearUnknown,
      deathYear: author.deathYear ?? null,
      deathStatus: author.deathStatus || "unknown",
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingAuthor(null);
    setForm(BLANK_AUTHOR);
  };

  const handleSaveAuthor = async () => {
    if (!form.name.trim()) {
      setModal({
        show: true,
        title: "Missing Name",
        message: "Author name is required.",
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),
        bio: form.bio || "",
        language,
        birthYear: form.birthYearUnknown ? null : form.birthYear || null,
        birthYearUnknown: !!form.birthYearUnknown,
        deathYear: form.deathStatus === "known" ? form.deathYear || null : null,
        deathStatus: form.deathStatus || "unknown",
      };

      if (editingAuthor) {
        const updated = await updateAuthor(editingAuthor._id, payload);

        setAuthors((prev) =>
          prev.map((author) => (author._id === updated._id ? updated : author)),
        );

        setModal({
          show: true,
          title: "Success",
          message: "Author updated successfully.",
        });
      } else {
        const created = await createAuthor(payload);

        setAuthors((prev) =>
          [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
        );

        setModal({
          show: true,
          title: "Success",
          message: "Author added successfully.",
        });
      }

      closeForm();
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message || "Failed to save author.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteFlow = async (author) => {
    setLoading(true);

    try {
      const linkedBooks = await fetchAuthorBooks(author._id);

      setDeleteFlow({
        show: true,
        author,
        linkedBooks,
        reassignMap: {},
      });
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message || "Failed to check linked books.",
      });
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteFlow = () => {
    setDeleteFlow({
      show: false,
      author: null,
      linkedBooks: [],
      reassignMap: {},
    });
  };

  const handleReassignChange = (slug, newAuthorId) => {
    setDeleteFlow((prev) => ({
      ...prev,
      reassignMap: {
        ...prev.reassignMap,
        [slug]: newAuthorId,
      },
    }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteFlow.author) return;

    const reassignments = deleteFlow.linkedBooks.map((book) => ({
      slug: book.slug,
      newAuthorId: deleteFlow.reassignMap[book.slug],
    }));

    const hasLinkedBooks = deleteFlow.linkedBooks.length > 0;
    const allReassigned =
      !hasLinkedBooks ||
      deleteFlow.linkedBooks.every(
        (book) => !!deleteFlow.reassignMap[book.slug],
      );

    if (!allReassigned) {
      setModal({
        show: true,
        title: "Reassignment Required",
        message:
          "Please reassign every linked book before deleting this author.",
      });
      return;
    }
    setSaving(true);

    try {
      const result = await deleteAuthor(deleteFlow.author._id, reassignments);

      setAuthors((prev) =>
        prev.filter((author) => author._id !== deleteFlow.author._id),
      );

      closeDeleteFlow();

      setModal({
        show: true,
        title: "Deleted",
        message: result.message || "Author deleted successfully.",
      });
    } catch (err) {
      setModal({
        show: true,
        title: "Error",
        message: err.message || "Failed to delete author.",
      });
    } finally {
      setSaving(false);
    }
  };

  const otherAuthors = authors.filter(
    (author) => author._id !== deleteFlow.author?._id,
  );

  const allReassigned =
    deleteFlow.linkedBooks.length === 0 ||
    deleteFlow.linkedBooks.every((book) => !!deleteFlow.reassignMap[book.slug]);

  return (
    <AdminLayout>
      <div className="max-w-[950px] mx-auto mt-8">
        <h1 className="text-center text-[#c3a421] text-2xl font-bold mb-0">
          Manage Authors
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Add, edit, search, or delete authors used in English and Arabic books.
        </p>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-4 py-2 rounded font-bold border ${
                  language === "en"
                    ? "bg-[#c3a421] text-white border-[#c3a421]"
                    : "bg-white text-[#323232] border-slate-300"
                }`}
              >
                English Authors
              </button>

              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={`px-4 py-2 rounded font-bold border ${
                  language === "ar"
                    ? "bg-[#c3a421] text-white border-[#c3a421]"
                    : "bg-white text-[#323232] border-slate-300"
                }`}
              >
                Arabic Authors
              </button>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="bg-[var(--bg-color-header)] text-white py-2 px-5 rounded font-bold"
            >
              + Add Author
            </button>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === "ar"
                ? "Search Arabic authors..."
                : "Search authors..."
            }
            className="mt-4 w-full border border-slate-300 rounded-[6px] py-2 px-4 text-base outline-none focus:border-[#c3a421]"
          />
        </div>

        {loading ? (
          <div className="text-center">Loading authors...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {filteredAuthors.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No authors found.
              </div>
            ) : (
              filteredAuthors.map((author) => (
                <div
                  key={author._id}
                  className="p-4 border-b border-slate-100 last:border-b-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="flex-1" {...contentDirectionProps}>
                    <h3 className="font-bold text-[#1e293b] text-lg mb-1">
                      {author.name}
                    </h3>

                    {author.bio && (
                      <p className="text-slate-600 text-sm line-clamp-2 mb-1">
                        {author.bio}
                      </p>
                    )}

                    <p className="text-xs text-slate-500">
                      Birth:{" "}
                      {author.birthYearUnknown
                        ? "Unknown"
                        : author.birthYear || "-"}{" "}
                      | Death:{" "}
                      {author.deathStatus === "living"
                        ? "Still alive"
                        : author.deathStatus === "unknown"
                          ? "Unknown"
                          : author.deathYear || "-"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(author)}
                      className="bg-gray-500 text-white py-2 px-4 rounded font-bold"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => openDeleteFlow(author)}
                      className="bg-[#e53e3e] text-white py-2 px-4 rounded font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9998] px-4">
          <div className="bg-white w-full max-w-[560px] rounded-lg shadow-lg p-6 text-[#1e293b] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#c3a421] mb-4">
              {editingAuthor ? "Edit Author" : "Add Author"}
            </h2>

            <label className={labelCls}>Name:</label>
            <input
              {...contentDirectionProps}
              className={contentFieldCls}
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Author name"
            />

            <label className={labelCls}>Bio:</label>
            <textarea
              {...contentDirectionProps}
              className={contentFieldCls}
              value={form.bio}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Author biography"
              rows={4}
            />

            <YearFields value={form} onChange={setForm} labelCls={labelCls} />

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="bg-slate-200 text-slate-700 py-2 px-5 rounded font-bold disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveAuthor}
                disabled={saving}
                className="bg-[#c3a421] text-white py-2 px-5 rounded font-bold disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Author"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteFlow.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] px-4">
          <div className="bg-white w-full max-w-[620px] rounded-lg shadow-lg p-6 text-[#1e293b] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#e53e3e] mb-3">
              Delete Author
            </h2>

            <p className="mb-4">
              You are deleting <strong>{deleteFlow.author?.name}</strong>.
            </p>

            {deleteFlow.linkedBooks.length === 0 ? (
              <p className="mb-4 text-slate-600">
                This author is not linked to any book. It can be deleted safely.
              </p>
            ) : (
              <>
                <p className="mb-4 text-slate-600">
                  This author is linked to {deleteFlow.linkedBooks.length} book
                  {deleteFlow.linkedBooks.length > 1 ? "s" : ""}. Reassign each
                  book before deleting.
                </p>

                {otherAuthors.length === 0 && (
                  <div className="bg-yellow-50 text-yellow-800 border border-yellow-200 rounded p-3 mb-4">
                    No other authors are available. Please create another author
                    first, then delete this author.
                  </div>
                )}

                {deleteFlow.linkedBooks.map((book) => (
                  <div
                    key={book.slug}
                    className="border border-slate-200 rounded-lg p-3 mb-3"
                  >
                    <p className="font-semibold mb-2">{book.title}</p>

                    <select
                      className="w-full border border-slate-300 rounded-[6px] py-2 px-3 outline-none focus:border-[#c3a421]"
                      value={deleteFlow.reassignMap[book.slug] || ""}
                      onChange={(e) =>
                        handleReassignChange(book.slug, e.target.value)
                      }
                    >
                      <option value="">-- Choose new author --</option>
                      {otherAuthors.map((author) => (
                        <option key={author._id} value={author._id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeDeleteFlow}
                disabled={saving}
                className="bg-slate-200 text-slate-700 py-2 px-5 rounded font-bold disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={
                  saving ||
                  (deleteFlow.linkedBooks.length > 0 &&
                    (!allReassigned || otherAuthors.length === 0))
                }
                className="bg-[#e53e3e] text-white py-2 px-5 rounded font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Deleting..." : "Delete Author"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-4 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[10000] w-[90%] max-w-[600px] text-center text-base">
          <strong className="text-[1.2rem] mb-2 block">{modal.title}</strong>
          <span>{modal.message}</span>
          <br />
          <button
            type="button"
            onClick={() => setModal({ show: false, title: "", message: "" })}
            className="bg-[var(--bg-color-header)] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer mt-4"
          >
            Close
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
