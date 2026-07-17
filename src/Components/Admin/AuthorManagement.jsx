// src/Components/Admin/AuthorManagement.jsx
import React, { useState } from "react";
import {
  updateAuthor,
  fetchAuthorBooks,
  deleteAuthor,
  createAuthor,
} from "../../api/adminBook";

const BLANK_AUTHOR_LIFE = {
  birthYear: null,
  birthYearUnknown: false,
  deathYear: null,
  deathStatus: "unknown",
};

function getAuthorDeathStatus(author) {
  return author?.deathStatus || "unknown";
}

function validateAuthorPayload(form) {
  const name = form.name?.trim();

  if (!name) return "Author name is required.";
  if (name.length < 2) return "Author name must be at least 2 characters.";

  if (!["known", "unknown", "living"].includes(form.deathStatus)) {
    return "Please select a valid death status.";
  }

  if (form.birthYear !== null && form.birthYear !== "") {
    const birth = Number(form.birthYear);

    if (!Number.isInteger(birth) || birth < 1) {
      return "Birth year must be a valid positive number.";
    }
  }

  if (form.deathStatus === "known") {
    const death = Number(form.deathYear);

    if (!Number.isInteger(death) || death < 1) {
      return "Death year is required when death status is known.";
    }

    if (form.birthYear && death < Number(form.birthYear)) {
      return "Death year cannot be before birth year.";
    }
  }

  return "";
}

export default function AuthorManagement({
  authors,
  setAuthors,
  selectedAuthorId,
  language,
  onSelect,
  onError,
  onSuccess,
  contentDirectionProps,
  fieldCls,
  labelCls,
  selectFieldCls,
  allowCreate = true,
}) {
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [linkedBooks, setLinkedBooks] = useState(null);
  const [reassignMap, setReassignMap] = useState({});
  const [busy, setBusy] = useState(false);

  const [creatingForSlug, setCreatingForSlug] = useState(null);
  const [newAuthorForm, setNewAuthorForm] = useState({
    name: "",
    bio: "",
    ...BLANK_AUTHOR_LIFE,
  });
  const [savingNew, setSavingNew] = useState(false);

  const handleAuthorSelect = (e) => {
    const id = e.target.value;

    if (!id) {
      onSelect(null);
      return;
    }

    const author = authors.find((a) => a._id === id);

    if (author) {
      onSelect({
        ...author,
        deathStatus: getAuthorDeathStatus(author),
      });
    }
  };

  const openEditAuthor = () => {
    const author = authors.find((x) => x._id === selectedAuthorId);

    if (!author) return;

    setEditingAuthor({
      ...author,
      birthYear: author.birthYear ?? null,
      birthYearUnknown: !!author.birthYearUnknown,
      deathYear: author.deathYear ?? null,
      deathStatus: getAuthorDeathStatus(author),
    });
  };

  const closeEditAuthor = () => {
    setEditingAuthor(null);
    setLinkedBooks(null);
    setReassignMap({});
    setCreatingForSlug(null);
    setNewAuthorForm({
      name: "",
      bio: "",
      ...BLANK_AUTHOR_LIFE,
    });
  };

  const buildPayload = (author) => ({
    name: author.name.trim(),
    bio: author.bio || "",
    language,
    birthYear: author.birthYearUnknown ? null : (author.birthYear ?? null),
    birthYearUnknown: !!author.birthYearUnknown,
    deathYear:
      author.deathStatus === "known" ? (author.deathYear ?? null) : null,
    deathStatus: author.deathStatus || "unknown",
  });

  const handleSaveAuthor = async () => {
    const error = validateAuthorPayload(editingAuthor);

    if (error) {
      onError(error);
      return;
    }

    setBusy(true);

    try {
      const updated = await updateAuthor(
        editingAuthor._id,
        buildPayload(editingAuthor),
      );

      setAuthors((prev) =>
        prev.map((a) => (a._id === updated._id ? updated : a)),
      );

      if (selectedAuthorId === updated._id) {
        onSelect({
          ...updated,
          deathStatus: getAuthorDeathStatus(updated),
        });
      }

      setEditingAuthor(null);
      onSuccess?.("Author updated successfully.");
    } catch (err) {
      onError(err.message || "Failed to update author.");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteAuthorClick = async () => {
    if (!editingAuthor?._id) return;

    setBusy(true);

    try {
      const books = await fetchAuthorBooks(editingAuthor._id);

      setLinkedBooks(Array.isArray(books) ? books : []);
      setReassignMap({});
      setCreatingForSlug(null);
      setNewAuthorForm({
        name: "",
        bio: "",
        ...BLANK_AUTHOR_LIFE,
      });
    } catch (err) {
      onError(err.message || "Failed to load linked books.");
    } finally {
      setBusy(false);
    }
  };

  const cancelDeleteFlow = () => {
    setLinkedBooks(null);
    setReassignMap({});
    setCreatingForSlug(null);
    setNewAuthorForm({
      name: "",
      bio: "",
      ...BLANK_AUTHOR_LIFE,
    });
  };

  const finishDelete = (message) => {
    setAuthors((prev) => prev.filter((a) => a._id !== editingAuthor._id));

    if (selectedAuthorId === editingAuthor._id) {
      onSelect(null);
    }

    setLinkedBooks(null);
    setReassignMap({});
    setCreatingForSlug(null);
    setNewAuthorForm({
      name: "",
      bio: "",
      ...BLANK_AUTHOR_LIFE,
    });
    setEditingAuthor(null);
    onSuccess?.(message || "Author deleted successfully.");
  };

  const handleConfirmDelete = async () => {
    setBusy(true);

    try {
      const reassignments =
        linkedBooks?.map((book) => ({
          slug: book.slug,
          newAuthorId: reassignMap[book.slug],
        })) || [];

      const result = await deleteAuthor(editingAuthor._id, reassignments);

      finishDelete(result.message);
    } catch (err) {
      onError(err.message || "Failed to delete author.");
    } finally {
      setBusy(false);
    }
  };

  const handleReassignDropdownChange = (slug, value) => {
    if (value === "__create_new__") {
      setCreatingForSlug(slug);
      setNewAuthorForm({
        name: "",
        bio: "",
        ...BLANK_AUTHOR_LIFE,
      });
      return;
    }

    setCreatingForSlug(null);

    setReassignMap((prev) => ({
      ...prev,
      [slug]: value,
    }));
  };

  const handleSaveNewAuthor = async () => {
    const error = validateAuthorPayload(newAuthorForm);

    if (error) {
      onError(error);
      return;
    }

    setSavingNew(true);

    try {
      const created = await createAuthor(buildPayload(newAuthorForm));

      setAuthors((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );

      setReassignMap((prev) => ({
        ...prev,
        [creatingForSlug]: created._id,
      }));

      setCreatingForSlug(null);
      setNewAuthorForm({
        name: "",
        bio: "",
        ...BLANK_AUTHOR_LIFE,
      });

      onSuccess?.("New author created. It has been selected for reassignment.");
    } catch (err) {
      onError(err.message || "Failed to create author.");
    } finally {
      setSavingNew(false);
    }
  };

  const allReassigned =
    linkedBooks?.length > 0 && linkedBooks.every((b) => !!reassignMap[b.slug]);

  const renderLifeFields = (value, setValue, radioName) => (
    <>
      <label className={labelCls}>Birth Year:</label>
      <div className="flex items-center gap-3 mb-4">
        <input
          type="number"
          className="flex-1 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
          value={value.birthYear ?? ""}
          disabled={!!value.birthYearUnknown}
          onChange={(e) =>
            setValue((prev) => ({
              ...prev,
              birthYear: e.target.value ? Number(e.target.value) : null,
            }))
          }
          placeholder="e.g. 1263"
        />

        <label className="flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={!!value.birthYearUnknown}
            onChange={(e) =>
              setValue((prev) => ({
                ...prev,
                birthYearUnknown: e.target.checked,
                birthYear: e.target.checked ? null : prev.birthYear,
              }))
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
            name={radioName}
            checked={value.deathStatus === "known"}
            onChange={() =>
              setValue((prev) => ({
                ...prev,
                deathStatus: "known",
              }))
            }
          />
          Death year known
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={radioName}
            checked={value.deathStatus === "unknown"}
            onChange={() =>
              setValue((prev) => ({
                ...prev,
                deathStatus: "unknown",
                deathYear: null,
              }))
            }
          />
          Death year unknown
        </label>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="radio"
            name={radioName}
            checked={value.deathStatus === "living"}
            onChange={() =>
              setValue((prev) => ({
                ...prev,
                deathStatus: "living",
                deathYear: null,
              }))
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
            className={fieldCls}
            value={value.deathYear ?? ""}
            onChange={(e) =>
              setValue((prev) => ({
                ...prev,
                deathYear: e.target.value ? Number(e.target.value) : null,
              }))
            }
            placeholder="e.g. 1328"
          />
        </>
      )}
    </>
  );

  return (
    <>
      <label className={labelCls}>Saved Author:</label>

      <div className="flex items-center gap-2">
        <select
          {...contentDirectionProps}
          className={`${selectFieldCls} flex-1`}
          value={selectedAuthorId || ""}
          onChange={handleAuthorSelect}
        >
          <option value="" disabled>
            -- Select saved author --
          </option>

          {authors.map((author) => (
            <option key={author._id} value={author._id}>
              {author.name}
            </option>
          ))}
        </select>

        {selectedAuthorId && (
          <button
            type="button"
            title="Edit author details"
            onClick={openEditAuthor}
            className="p-2 rounded-lg border border-[#ccc] hover:bg-gray-50 shrink-0"
          >
            ✏️
          </button>
        )}
      </div>

      {editingAuthor && !linkedBooks && (
        <div className="block fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-6 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[10000] w-[90%] max-w-[550px] overflow-y-auto max-h-[90vh]">
          <strong className="block text-[1.1rem] mb-3">Edit Author</strong>

          <label className={labelCls}>Name:</label>
          <input
            {...contentDirectionProps}
            className={fieldCls}
            value={editingAuthor.name || ""}
            onChange={(e) =>
              setEditingAuthor((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
          />

          <label className={labelCls}>Bio:</label>
          <textarea
            {...contentDirectionProps}
            className={fieldCls}
            value={editingAuthor.bio || ""}
            onChange={(e) =>
              setEditingAuthor((prev) => ({
                ...prev,
                bio: e.target.value,
              }))
            }
          />

          {renderLifeFields(
            editingAuthor,
            setEditingAuthor,
            "editingAuthorDeathStatus",
          )}

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              disabled={busy}
              className="bg-[#287346] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
              onClick={handleSaveAuthor}
            >
              {busy ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              disabled={busy}
              className="bg-[#e53e3e] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
              onClick={closeEditAuthor}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={busy}
              className="bg-transparent text-[#e53e3e] border border-[#e53e3e] py-2 px-4 font-bold rounded-[6px] cursor-pointer ml-auto disabled:opacity-50"
              onClick={handleDeleteAuthorClick}
            >
              🗑 Delete Author
            </button>
          </div>
        </div>
      )}

      {editingAuthor && linkedBooks && (
        <div className="block fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-6 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[10001] w-[90%] max-w-[580px] overflow-y-auto max-h-[90vh]">
          <strong className="block text-[1.1rem] mb-2">
            {linkedBooks.length === 0
              ? `Delete "${editingAuthor.name}"?`
              : `Can't delete "${editingAuthor.name}" yet`}
          </strong>

          {linkedBooks.length === 0 ? (
            <>
              <p className="mb-4">
                This author is not linked to any books. Deleting is safe.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy}
                  className="bg-[#e53e3e] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                  onClick={handleConfirmDelete}
                >
                  {busy ? "Deleting..." : "Yes, Delete"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  className="bg-[#287346] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                  onClick={cancelDeleteFlow}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4">
                This author is linked to {linkedBooks.length} book
                {linkedBooks.length > 1 ? "s" : ""}. Reassign each one to a
                different author below, then delete.
              </p>

              <div className="mb-4">
                {linkedBooks.map((book) => (
                  <div
                    key={book.slug}
                    className="mb-4 pb-4 border-b border-[#eee] last:border-b-0"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="font-medium flex-1">{book.title}</span>

                      <select
                        className="px-2 py-1 border border-[#ccc] rounded-md text-sm min-w-[180px]"
                        value={
                          creatingForSlug === book.slug
                            ? "__create_new__"
                            : reassignMap[book.slug] || ""
                        }
                        onChange={(e) =>
                          handleReassignDropdownChange(
                            book.slug,
                            e.target.value,
                          )
                        }
                      >
                        <option value="">-- Choose new author --</option>

                        {authors
                          .filter((a) => a._id !== editingAuthor._id)
                          .map((author) => (
                            <option key={author._id} value={author._id}>
                              {author.name}
                            </option>
                          ))}

                        {allowCreate && (
                          <option value="__create_new__">
                            ➕ Create new author…
                          </option>
                        )}
                      </select>
                    </div>

                    {creatingForSlug === book.slug && (
                      <div className="mt-2 p-4 bg-[#f8f9fa] border border-[#ddd] rounded-lg">
                        <strong className="block text-sm mb-3 text-[#1e293b]">
                          New Author for "{book.title}"
                        </strong>

                        <label className="font-bold text-sm block mb-1 text-[var(--bg-color-header)]">
                          Name:
                        </label>
                        <input
                          {...contentDirectionProps}
                          className="block w-full mb-3 px-3 py-2 text-sm border border-[#ccc] rounded-lg"
                          value={newAuthorForm.name}
                          onChange={(e) =>
                            setNewAuthorForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Author name"
                          autoFocus
                        />

                        <label className="font-bold text-sm block mb-1 text-[var(--bg-color-header)]">
                          Bio:
                        </label>
                        <textarea
                          {...contentDirectionProps}
                          className="block w-full mb-3 px-3 py-2 text-sm border border-[#ccc] rounded-lg"
                          rows={2}
                          value={newAuthorForm.bio}
                          onChange={(e) =>
                            setNewAuthorForm((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          placeholder="Short biography"
                        />

                        {renderLifeFields(
                          newAuthorForm,
                          setNewAuthorForm,
                          "newAuthorDeathStatus",
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={savingNew}
                            className="bg-[#287346] text-white border-none py-1.5 px-4 text-sm font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                            onClick={handleSaveNewAuthor}
                          >
                            {savingNew ? "Saving…" : "Save Author"}
                          </button>

                          <button
                            type="button"
                            disabled={savingNew}
                            className="bg-transparent text-[#555] border border-[#ccc] py-1.5 px-4 text-sm font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                            onClick={() => {
                              setCreatingForSlug(null);
                              setNewAuthorForm({
                                name: "",
                                bio: "",
                                ...BLANK_AUTHOR_LIFE,
                              });
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {reassignMap[book.slug] &&
                      creatingForSlug !== book.slug && (
                        <p className="text-xs text-[#287346] mt-1">
                          ✓ Will be reassigned to{" "}
                          <strong>
                            {authors.find(
                              (a) => a._id === reassignMap[book.slug],
                            )?.name ?? "selected author"}
                          </strong>
                        </p>
                      )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={busy || !allReassigned || !!creatingForSlug}
                  className="bg-[#e53e3e] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                  onClick={handleConfirmDelete}
                >
                  {busy ? "Deleting..." : "Reassign & Delete"}
                </button>

                <button
                  type="button"
                  disabled={busy}
                  className="bg-[#287346] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer disabled:opacity-50"
                  onClick={cancelDeleteFlow}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
