import React, { useState } from "react";
import BlockEditor from "../../Components/Admin/BlockEditor";
import { API_BASE } from "../../../config";


export default function PageEditor({
  page,
  onChange,
  onDelete,
  onAddBlock,
  bookId,
}) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const updateBlock = (idx, newBlock) => {
    const blocks = [...page.blocks];
    blocks[idx] = newBlock;
    onChange({ ...page, blocks });
  };

  const deleteBlock = (idx) => {
    const blocks = page.blocks.filter((_, i) => i !== idx);
    onChange({ ...page, blocks });
  };

  const updateField = (field, value) => onChange({ ...page, [field]: value });

  const handleRefsChange = (e) =>
    updateField(
      "references",
      e.target.value
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
    );

  const handleAudioChange = (e) => updateField("audioUrl", e.target.value);

  const handleSaveAudio = async () => {
    if (!page.audioUrl || !page.audioUrl.startsWith("http")) {
      alert("⚠️ Please enter a valid audio link (must start with http)");
      return;
    }
    console.log("Saving audio for", {
      bookId,
      pageNumber: page.number,
      url: page.audioUrl,
    });

    try {
      setSaving(true);
      setStatus("Saving...");

    const res = await fetch(`${API_BASE}/api/books/admin/${bookId}/audio`, 
 {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageNumber: page.number,
        audioLink: page.audioUrl,
      }),
    });

      console.log("Response status:", res.status);
      const rawText = await res.text();
      console.log("Raw response:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        throw new Error("Invalid JSON: " + rawText);
      }

      console.log("Parsed data:", data);

      if (res.ok && data.success) {
        setStatus(`✅ Audio link added successfully to page ${page.number}`);
      } else {
        setStatus(`⚠️ ${data.error || "Error saving audio link."}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setStatus("💥 Server error while saving audio link: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-[#ccc] rounded-lg p-4 mb-4 bg-[#fafafa] ml-8">
      {/* Page Number */}
      <label className="block mb-3">
        <span className="block text-sm font-semibold mb-1">Page #</span>
        <input
          type="number"
          value={page.number || ""}
          onChange={(e) => updateField("number", Number(e.target.value))}
          className="border border-[#ccc] rounded px-2 py-1 text-sm w-24 font-normal"
        />
      </label>

      {/* Blocks */}
      <div>
        {page.blocks.map((block, idx) => (
          <BlockEditor
            key={idx}
            block={block}
            onChange={(newBlock) => updateBlock(idx, newBlock)}
            onDelete={() => deleteBlock(idx)}
          />
        ))}

        {/* References */}
        <label className="block mb-3">
          <span className="block text-sm font-semibold mb-1">References</span>
          <input
            value={page.references?.join(", ") || ""}
            onChange={handleRefsChange}
            className="w-full border border-[#ccc] rounded px-2 py-1 text-sm font-normal"
          />
        </label>

        <button
          type="button"
          onClick={onAddBlock}
          className="bg-[#c3a421] text-white text-sm px-3 py-1 rounded cursor-pointer border-none mr-2"
        >
          Add Block
        </button>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded cursor-pointer border-none mt-3"
      >
        Remove Page
      </button>

      {/* Audio Link Section */}
      <div className="mt-4 pt-4 border-t border-[#ddd]">
        <label className="block font-bold mb-2">
          🎧 Add Audio Link (S3 URL)
        </label>
        <input
          type="text"
          value={page.audioUrl || ""}
          onChange={handleAudioChange}
          placeholder="Paste your S3 audio link here..."
          className="w-full border border-[#ccc] rounded px-2 py-[6px] mb-2 text-sm"
        />
        <button
          onClick={handleSaveAudio}
          disabled={saving}
          className={`
            text-white px-3 py-[6px] rounded border-none cursor-pointer text-sm
            ${saving ? "bg-[#aaa] cursor-not-allowed" : "bg-[#2563eb] hover:bg-[#1d4ed8]"}
          `}
        >
          {saving ? "Saving..." : "💾 Save Audio Link"}
        </button>
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
    </div>
  );
}
