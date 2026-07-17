import React from "react";
import PageEditor from "./PageEditor";

export default function ChapterEditor({
  chapter,
  onChange,
  onDelete,
  onAddPage,
  bookId,
}) {
  const pages = chapter.pages || [];

  const updatePage = (idx, newPage) => {
    const newPages = [...pages];
    newPages[idx] = newPage;
    onChange({ ...chapter, pages: newPages });
  };

  const deletePage = (idx) => {
    const newPages = pages.filter((_, i) => i !== idx);
    onChange({ ...chapter, pages: newPages });
  };

  const updateField = (field, value) =>
    onChange({ ...chapter, [field]: value });

  return (
    <div className="border border-[#bbb] rounded-xl p-5 mb-5 bg-white">
      <label className="block mb-3">
        <span className="block text-sm font-semibold mb-1">Chapter Title</span>
        <input
          value={chapter.title || ""}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full border border-[#ccc] rounded px-2 py-1 text-sm font-normal"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-sm font-semibold mb-1">Chapter #</span>
        <input
          type="number"
          value={chapter.number || ""}
          onChange={(e) => updateField("number", Number(e.target.value))}
          className="border border-[#ccc] rounded px-2 py-1 text-sm w-24 font-normal"
        />
      </label>

      <div>
        {pages.map((page, idx) => (
          <PageEditor
            key={idx}
            page={page}
            bookId={bookId}
            onChange={(newPage) => updatePage(idx, newPage)}
            onDelete={() => deletePage(idx)}
            onAddBlock={() =>
              updatePage(idx, {
                ...page,
                blocks: [
                  ...(page.blocks || []),
                  {
                    type: "paragraph",
                    text: "",
                    reference: "",
                    narrator: "",
                    commentary: "",
                  },
                ],
              })
            }
          />
        ))}

        <button
          type="button"
          onClick={onAddPage}
          className="bg-[#c3a421] text-white text-sm px-3 py-1 rounded cursor-pointer border-none mr-2"
        >
          Add Page
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="bg-red-500 text-white text-sm px-3 py-1 rounded cursor-pointer border-none mt-3"
      >
        Delete Chapter
      </button>
    </div>
  );
}
