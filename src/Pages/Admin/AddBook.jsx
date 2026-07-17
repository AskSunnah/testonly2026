// src/pages/AddBook.jsx
import React, { useState, useEffect } from "react";
import { submitBook, fetchAuthors } from "../../api/adminBook";
import AdminLayout from "../../Components/Admin/AdminLayout";
import AuthorManager from "../../Components/Admin/AuthorManagement";
import BookPreview from "../../Components/Admin/BookPreview";

const CATEGORIES = [
  { value: "", label: "-- Select Category --" },
  { value: "Aqeedah", label: "Aqeedah Books" },
  { value: "Fiqh", label: "Fiqh" },
  { value: "Hadith", label: "Hadith" },
];

const LANGS = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
];

export default function AddBook() {
  const [form, setForm] = useState({
    title: "",
    authorId: "",
    author: "",
    description: "",
    authorBio: "",
    aboutBook: "",
    category: "",
    language: "en",
    birthYear: null,
    birthYearUnknown: false,
    deathYear: null,
    deathStatus: "unknown",
  });

  const [chapters, setChapters] = useState([]);
  const [modal, setModal] = useState({ show: false, title: "", message: "" });
  const [deletePageIndex, setDeletePageIndex] = useState(null);
  const [authors, setAuthors] = useState([]);

  const isArabic = form.language === "ar";

  const contentDirectionProps = isArabic
    ? { dir: "rtl", lang: "ar", style: { unicodeBidi: "plaintext" } }
    : { dir: "ltr", lang: "en", style: { unicodeBidi: "plaintext" } };

  const fieldCls =
    "block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border";

  const labelCls = "font-bold mt-4 block text-[var(--bg-color-header)]";

  const contentFieldCls = `${fieldCls} ${
    isArabic ? "text-right leading-8" : "text-left"
  }`;

  const selectFieldCls = `${fieldCls} ${isArabic ? "text-right" : "text-left"}`;

  const referenceFieldCls = `flex-1 mb-0 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border ${
    isArabic ? "text-right leading-8" : "text-left"
  }`;

  const referenceRowCls = `flex items-center gap-2 mb-2 ${
    isArabic ? "flex-row-reverse" : ""
  }`;

  useEffect(() => {
    fetchAuthors(form.language)
      .then(setAuthors)
      .catch(() => setAuthors([]));
  }, [form.language]);

  // Called by AuthorManager when the user picks/clears a saved author
  const handleAuthorChange = (author) => {
    if (!author) {
      setForm((f) => ({
        ...f,
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

    setForm((f) => ({
      ...f,
      authorId: author._id,
      author: author.name,
      authorBio: author.bio || "",
      birthYear: author.birthYear ?? null,
      birthYearUnknown: !!author.birthYearUnknown,
      deathYear: author.deathYear ?? null,
      deathStatus: author.deathStatus || "unknown",
    }));
  };

  // 🔢 Get global page number for a chapter/page index
  const getGlobalPageNumber = (chapterIdx, pageIdx) => {
    let counter = 1;

    for (let i = 0; i < chapters.length; i++) {
      for (let j = 0; j < chapters[i].pages.length; j++) {
        if (i === chapterIdx && j === pageIdx) return counter;
        counter++;
      }
    }

    return counter;
  };

  // --- Chapter Helpers ---
  const addChapter = () => {
    setChapters([...chapters, { title: "", pages: [] }]);
  };

  const updateChapter = (idx, newChapter) => {
    setChapters(chapters.map((ch, i) => (i === idx ? newChapter : ch)));
  };

  const removeChapter = (idx) => {
    setChapters(chapters.filter((_, i) => i !== idx));
  };

  const addPage = (chapterIdx) => {
    const chs = [...chapters];
    chs[chapterIdx].pages.push({ references: [], blocks: [] });
    setChapters(chs);
  };

  const removePage = (chapterIdx, pageIdx) => {
    setChapters(
      chapters.map((ch, i) =>
        i !== chapterIdx
          ? ch
          : { ...ch, pages: ch.pages.filter((_, j) => j !== pageIdx) },
      ),
    );
    setDeletePageIndex(null);
  };

  // --- Reference Helpers ---
  const addReference = (chapterIdx, pageIdx) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].references.push("");
    setChapters(chs);
  };

  const updateReference = (chapterIdx, pageIdx, refIdx, val) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].references[refIdx] = val;
    setChapters(chs);
  };

  const removeReference = (chapterIdx, pageIdx, refIdx) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].references.splice(refIdx, 1);
    setChapters(chs);
  };

  // --- Block Helpers ---
  const addBlock = (chapterIdx, pageIdx) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].blocks.push({
      type: "heading",
      text: "",
      reference: "",
      narrator: "",
      commentary: "",
    });
    setChapters(chs);
  };

  const updateBlock = (chapterIdx, pageIdx, blockIdx, block) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].blocks[blockIdx] = block;
    setChapters(chs);
  };

  const removeBlock = (chapterIdx, pageIdx, blockIdx) => {
    const chs = [...chapters];
    chs[chapterIdx].pages[pageIdx].blocks.splice(blockIdx, 1);
    setChapters(chs);
  };

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    if (name === "language") {
      setForm({
        ...form,
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

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !["known", "unknown", "living"].includes(form.deathStatus || "unknown")
    ) {
      setModal({
        show: true,
        title: "Invalid Death Status",
        message: "Please select a valid death status.",
      });
      return;
    }

    if (form.deathStatus === "known" && !form.deathYear) {
      setModal({
        show: true,
        title: "Missing Death Year",
        message: "Death year is required when death status is known.",
      });
      return;
    }

    if (
      form.deathStatus === "known" &&
      form.birthYear &&
      form.deathYear &&
      Number(form.deathYear) < Number(form.birthYear)
    ) {
      setModal({
        show: true,
        title: "Invalid Years",
        message: "Death year cannot be before birth year.",
      });
      return;
    }
    let pageCounter = 1;

    const bookData = {
      ...form,
      chapters: chapters.map((ch, chIdx) => {
        const pagesWithNumbers = ch.pages.map((pg) => ({
          ...pg,
          number: pageCounter++,
        }));

        return {
          ...ch,
          number: chIdx + 1,
          pages: pagesWithNumbers,
        };
      }),
    };

    try {
      await submitBook(bookData);

      const updatedAuthors = await fetchAuthors(form.language);
      setAuthors(updatedAuthors);

      setModal({
        show: true,
        title: "Success",
        message: "Book added successfully!",
      });

      setForm({
        title: "",
        authorId: "",
        author: "",
        description: "",
        authorBio: "",
        aboutBook: "",
        category: "",
        language: "en",
        birthYear: null,
        birthYearUnknown: false,
        deathYear: null,
        deathStatus: "unknown",
      });

      setChapters([]);
    } catch (err) {
      setModal({ show: true, title: "Error", message: err.message });
    }
  };

  const closeModal = () => setModal({ ...modal, show: false });

  return (
    <AdminLayout>
      <div className="w-full max-w-[850px] flex flex-col items-center mx-auto font-[Segoe_UI,sans-serif]">
        <h1 className="text-[2rem] mb-6 text-center text-[var(--bg-color-header)]">
          Add a New Book
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-full"
        >
          <label className={labelCls}>Title:</label>
          <input
            {...contentDirectionProps}
            className={contentFieldCls}
            name="title"
            value={form.title}
            onChange={handleFormChange}
            required
          />

          <label className={labelCls}>Language:</label>
          <select
            className={fieldCls}
            name="language"
            value={form.language}
            onChange={handleFormChange}
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

          <AuthorManager
            authors={authors}
            setAuthors={setAuthors}
            selectedAuthorId={form.authorId}
            language={form.language}
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
          />

          {/* Freeform author fields — only editable when no saved author is selected */}
          <label className={labelCls}>Author:</label>
          <input
            {...contentDirectionProps}
            className={contentFieldCls}
            name="author"
            value={form.author}
            onChange={handleFormChange}
            disabled={!!form.authorId}
          />

          <label className={labelCls}>About the Author:</label>
          <textarea
            {...contentDirectionProps}
            className={contentFieldCls}
            name="authorBio"
            value={form.authorBio}
            onChange={handleFormChange}
            disabled={!!form.authorId}
            placeholder="Write a short biography or background of the author"
          />

          {/* DOB / DOD — only editable when no saved author is selected */}
          <label className={labelCls}>Birth Year:</label>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="number"
              className="flex-1 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
              value={form.birthYear ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  birthYear: e.target.value ? Number(e.target.value) : null,
                }))
              }
              disabled={!!form.authorId || form.birthYearUnknown}
              placeholder="e.g. 1263"
            />
            <label className="flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.birthYearUnknown}
                disabled={!!form.authorId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    birthYearUnknown: e.target.checked,
                    birthYear: e.target.checked ? null : f.birthYear,
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
                name="deathStatus"
                checked={form.deathStatus === "known"}
                disabled={!!form.authorId}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    deathStatus: "known",
                  }))
                }
              />
              Death year known
            </label>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="deathStatus"
                checked={form.deathStatus === "unknown"}
                disabled={!!form.authorId}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
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
                name="deathStatus"
                checked={form.deathStatus === "living"}
                disabled={!!form.authorId}
                onChange={() =>
                  setForm((f) => ({
                    ...f,
                    deathStatus: "living",
                    deathYear: null,
                  }))
                }
              />
              Still alive
            </label>
          </div>

          {form.deathStatus === "known" && (
            <>
              <label className={labelCls}>Death Year:</label>
              <input
                type="number"
                className="block w-full mb-4 px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
                value={form.deathYear ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deathYear: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                disabled={!!form.authorId}
                placeholder="e.g. 1328"
              />
            </>
          )}

          <label className={labelCls}>Description (if any):</label>
          <textarea
            {...contentDirectionProps}
            className={contentFieldCls}
            name="description"
            value={form.description}
            onChange={handleFormChange}
          />

          <label className={labelCls}>About the Book:</label>
          <textarea
            {...contentDirectionProps}
            className={contentFieldCls}
            name="aboutBook"
            value={form.aboutBook}
            onChange={handleFormChange}
            placeholder="Write details about the book, its purpose, topic, and importance"
          />

          <label className={labelCls}>Category:</label>
          <select
            className={fieldCls}
            name="category"
            value={form.category}
            onChange={handleFormChange}
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

          {/* Chapters */}
          {chapters.map((ch, chIdx) => (
            <div
              key={chIdx}
              className="border border-[#ccc] p-4 mb-8 bg-[#fefefe] relative rounded-lg"
            >
              <button
                type="button"
                className="absolute top-[10px] right-[10px] bg-[#e53e3e] text-white border-none py-[0.3rem] px-[0.8rem] text-[0.85rem] rounded-[6px] cursor-pointer w-auto h-auto whitespace-nowrap"
                onClick={() => removeChapter(chIdx)}
              >
                Delete Chapter
              </button>

              <h3 className="text-base font-bold mt-0">Chapter {chIdx + 1}</h3>

              <label className={labelCls}>Chapter Title:</label>
              <input
                {...contentDirectionProps}
                className={contentFieldCls}
                value={ch.title}
                onChange={(e) =>
                  updateChapter(chIdx, {
                    ...ch,
                    title: e.target.value,
                    pages: ch.pages,
                  })
                }
                required
              />

              {/* Pages */}
              <div>
                {ch.pages.map((pg, pgIdx) => (
                  <div
                    key={pgIdx}
                    className="border border-[#ccc] p-4 mb-8 bg-[#f9f9f9] relative rounded-lg"
                  >
                    <button
                      type="button"
                      className="absolute top-[10px] right-[10px] bg-[#e53e3e] text-white border-none py-[0.3rem] px-[0.8rem] text-[0.85rem] rounded-[6px] cursor-pointer w-auto h-auto whitespace-nowrap"
                      onClick={() =>
                        setDeletePageIndex({ chapter: chIdx, page: pgIdx })
                      }
                    >
                      Delete Page
                    </button>

                    <h4 className="text-sm font-bold mt-0">
                      Page {getGlobalPageNumber(chIdx, pgIdx)}
                    </h4>

                    <label className={labelCls}>References:</label>

                    {pg.references.length === 0 && (
                      <p className="italic text-[#888]">
                        No references added yet.
                      </p>
                    )}

                    {pg.references.map((ref, refIdx) => (
                      <div key={refIdx} className={referenceRowCls}>
                        <input
                          {...contentDirectionProps}
                          className={referenceFieldCls}
                          value={ref}
                          onChange={(e) =>
                            updateReference(
                              chIdx,
                              pgIdx,
                              refIdx,
                              e.target.value,
                            )
                          }
                          placeholder="Reference"
                        />
                        <button
                          type="button"
                          className="bg-[#e53e3e] text-white border-none py-[0.3rem] px-[0.8rem] text-[0.85rem] rounded-[6px] cursor-pointer w-auto h-auto whitespace-nowrap"
                          onClick={() => removeReference(chIdx, pgIdx, refIdx)}
                        >
                          Delete reference
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="bg-[var(--bg-color-header)] text-white border-none py-2 px-4 mt-2 cursor-pointer font-bold rounded-lg w-fit"
                      onClick={() => addReference(chIdx, pgIdx)}
                    >
                      + Add Reference
                    </button>

                    <hr className="my-6 border-t border-[#ccc]" />

                    <label className={labelCls}>Content:</label>

                    {pg.blocks.length === 0 && (
                      <p className="italic text-[#888]">
                        No content on this page yet.
                      </p>
                    )}

                    {pg.blocks.map((block, blockIdx) => (
                      <div
                        key={blockIdx}
                        className="border border-dashed border-[#999] my-4 p-4 bg-[#f9f9f9] relative rounded-lg box-border"
                      >
                        <button
                          type="button"
                          className="absolute top-[10px] right-[10px] bg-[#e53e3e] text-white border-none py-[0.3rem] px-[0.8rem] text-[0.85rem] rounded-[6px] cursor-pointer w-auto h-auto whitespace-nowrap"
                          onClick={() => removeBlock(chIdx, pgIdx, blockIdx)}
                        >
                          Delete Content
                        </button>

                        <label className={labelCls}>Type</label>
                        <select
                          className={fieldCls}
                          value={block.type}
                          onChange={(e) =>
                            updateBlock(chIdx, pgIdx, blockIdx, {
                              ...block,
                              type: e.target.value,
                            })
                          }
                          dir="ltr"
                          lang="en"
                        >
                          <option value="heading">Heading</option>
                          <option value="paragraph">Paragraph</option>
                          <option value="hadith">Hadith</option>
                          <option value="ayah">Ayah</option>
                          <option value="quote">Quote</option>
                        </select>

                        <label className={labelCls}>Text</label>
                        <textarea
                          {...contentDirectionProps}
                          className={contentFieldCls}
                          value={block.text}
                          onChange={(e) =>
                            updateBlock(chIdx, pgIdx, blockIdx, {
                              ...block,
                              text: e.target.value,
                            })
                          }
                          required
                        />

                        {["hadith", "ayah", "quote"].includes(block.type) && (
                          <>
                            <label className={labelCls}>Reference</label>
                            <input
                              {...contentDirectionProps}
                              className={contentFieldCls}
                              value={block.reference}
                              onChange={(e) =>
                                updateBlock(chIdx, pgIdx, blockIdx, {
                                  ...block,
                                  reference: e.target.value,
                                })
                              }
                            />
                          </>
                        )}

                        {block.type === "hadith" && (
                          <>
                            <label className={labelCls}>Narrator</label>
                            <input
                              {...contentDirectionProps}
                              className={contentFieldCls}
                              value={block.narrator}
                              onChange={(e) =>
                                updateBlock(chIdx, pgIdx, blockIdx, {
                                  ...block,
                                  narrator: e.target.value,
                                })
                              }
                            />
                          </>
                        )}

                        {["hadith", "ayah", "quote"].includes(block.type) && (
                          <>
                            <label className={labelCls}>Commentary</label>
                            <textarea
                              {...contentDirectionProps}
                              className={contentFieldCls}
                              value={block.commentary}
                              onChange={(e) =>
                                updateBlock(chIdx, pgIdx, blockIdx, {
                                  ...block,
                                  commentary: e.target.value,
                                })
                              }
                            />
                          </>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="bg-[var(--bg-color-header)] text-white border-none py-2 px-4 mt-2 cursor-pointer font-bold rounded-lg w-fit"
                      onClick={() => addBlock(chIdx, pgIdx)}
                    >
                      + Add Content on Page
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="bg-[var(--bg-color-header)] text-white border-none py-2 px-4 mt-2 cursor-pointer font-bold rounded-lg w-fit"
                  onClick={() => addPage(chIdx)}
                >
                  + Add Page
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="bg-[var(--bg-color-header)] text-white border-none py-2 px-4 mt-2 cursor-pointer font-bold rounded-lg w-fit"
            onClick={addChapter}
          >
            + Add Chapter
          </button>

          <br />
          <br />
          {/* Preview — live, no save needed */}
          <div className="mt-6 flex justify-center">
            <BookPreview
              book={{
                ...form,
                chapters,
              }}
              lang={form.language}
            />
          </div>

          <button
            type="submit"
            className="bg-[var(--bg-color-header)] text-white border-none py-[0.7rem] px-[1.4rem] rounded-lg text-base font-bold cursor-pointer mt-4 w-full block transition-colors duration-300 hover:bg-[#1f5c38]"
          >
            Submit Book
          </button>
        </form>
      </div>

      {/* Success/Error Modal */}
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

      {/* Delete Page Confirmation Modal */}
      {deletePageIndex && (
        <div className="block fixed top-5 left-1/2 -translate-x-1/2 bg-white text-[#1e293b] border border-[#ccc] py-6 px-8 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[10000] w-[90%] max-w-[400px] text-center text-base">
          <strong className="block text-[1.1rem] mb-3">
            Delete Page #
            {getGlobalPageNumber(deletePageIndex.chapter, deletePageIndex.page)}
          </strong>
          <span>Are you sure you want to delete this page?</span>
          <br />
          <br />
          <button
            type="button"
            className="bg-[#287346] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer mr-4"
            onClick={() =>
              removePage(deletePageIndex.chapter, deletePageIndex.page)
            }
          >
            Yes
          </button>
          <button
            type="button"
            className="bg-[#e53e3e] text-white border-none py-2 px-5 font-bold rounded-[6px] cursor-pointer"
            onClick={() => setDeletePageIndex(null)}
          >
            No
          </button>
        </div>
      )}
    </AdminLayout>
  );
}
