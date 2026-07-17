export default function BlockEditor({ block, onChange, onDelete }) {
  return (
    <div className="border border-[#ddd] rounded-lg p-4 mb-3 bg-white">
      <label className="block mb-3">
        <span className="block text-sm font-semibold mb-1">Type</span>
        <select
          value={block.type}
          onChange={(e) => onChange({ ...block, type: e.target.value })}
          className="w-full border border-[#ccc] rounded px-2 py-1 text-sm font-normal"
        >
          <option value="heading">Heading</option>
          <option value="paragraph">Paragraph</option>
          <option value="ayah">Ayah</option>
          <option value="hadith">Hadith</option>
          <option value="quote">Quote</option>
        </select>
      </label>

      <label className="block mb-3">
        <span className="block text-sm font-semibold mb-1">Text</span>
        <textarea
          rows={2}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          className="w-full border border-[#ccc] rounded px-2 py-1 text-sm resize-y font-normal"
        />
      </label>

      <button
        type="button"
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded cursor-pointer border-none"
      >
        Remove Block
      </button>
    </div>
  );
}
