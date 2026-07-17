import ChapterEditor from "./ChapterEditor";

export default function BookEditor({ book, onChange }) {
  const renumberPagesGlobally = (bookDraft) => {
    let counter = 1;
    const newChapters = (bookDraft.chapters || []).map((ch) => {
      const newPages = (ch.pages || []).map((p) => ({
        ...p,
        number: counter++,
      }));
      return { ...ch, pages: newPages };
    });
    return { ...bookDraft, chapters: newChapters };
  };

  const updateChapter = (idx, newChapter) => {
    const chapters = [...(book.chapters || [])];
    chapters[idx] = newChapter;
    onChange(renumberPagesGlobally({ ...book, chapters }));
  };

  const deleteChapter = (idx) => {
    const chapters = (book.chapters || []).filter((_, i) => i !== idx);
    onChange(renumberPagesGlobally({ ...book, chapters }));
  };

  const addChapter = () => {
    const chapters = [
      ...(book.chapters || []),
      {
        title: "",
        number: (book.chapters?.length || 0) + 1,
        pages: [],
      },
    ];
    onChange(renumberPagesGlobally({ ...book, chapters }));
  };

  return (
    <div>
      {book.chapters.map((ch, idx) => (
        <ChapterEditor
          key={idx}
          chapter={ch}
          bookId={book._id}
          onChange={(newCh) => updateChapter(idx, newCh)}
          onDelete={() => deleteChapter(idx)}
          onAddPage={() => {
            const newPage = {
              number: 1,
              blocks: [
                {
                  type: "paragraph",
                  text: "",
                  reference: "",
                  narrator: "",
                  commentary: "",
                },
              ],
              references: [],
              audioUrl: "",
            };
            updateChapter(idx, {
              ...ch,
              pages: [...(ch.pages || []), newPage],
            });
          }}
        />
      ))}

      <button
        type="button"
        onClick={addChapter}
        className="bg-[#c3a421] text-white text-sm px-3 py-1 rounded cursor-pointer border-none"
      >
        Add Chapter
      </button>
    </div>
  );
}
