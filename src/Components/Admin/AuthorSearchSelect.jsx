// src/Components/Admin/AuthorSearchSelect.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";

// "Ṭaḥawi", "Ja'far", "Jaʿfar" -> "tahawi", "jafar", "jafar"
// so typing plain English letters still finds transliterated names.
const normalize = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics (ṭ -> t, ḥ -> h)
    .replace(/[ʿʾʻʼ'’`]/g, "") // strip ayn/hamza/apostrophes
    .toLowerCase()
    .trim();

export default function AuthorSearchSelect({
  authors,
  value, // selected author _id
  onChange, // (authorId | "") => void
  contentDirectionProps = {},
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const selected = authors.find((a) => a._id === value);

  const filtered = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return authors;
    return authors.filter((a) => {
      const name = normalize(a.name);
      return tokens.every((t) => name.includes(t));
    });
  }, [authors, query]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset highlight when results change
  useEffect(() => setActive(0), [query]);

  // Keep highlighted row visible while using arrow keys
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (id) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && open) {
      e.preventDefault(); // don't submit the book form
      if (filtered[active]) choose(filtered[active]._id);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        {...contentDirectionProps}
        type="text"
        role="combobox"
        aria-expanded={open}
        autoComplete="off"
        className="block w-full px-3 py-[0.6rem] text-base border border-[#ccc] rounded-lg box-border"
        placeholder={selected ? selected.name : "-- Search saved author --"}
        value={open ? query : selected?.name || ""}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {open && (
        <ul
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto bg-white border border-[#ccc] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-50 m-0 p-0 list-none"
        >
          {value && (
            <li
              className="px-3 py-2 text-sm text-[#e53e3e] cursor-pointer hover:bg-gray-100 border-b border-[#eee]"
              onMouseDown={(e) => {
                e.preventDefault();
                choose("");
              }}
            >
              ✕ Clear selection
            </li>
          )}

          {filtered.length === 0 && (
            <li className="px-3 py-2 text-sm italic text-[#888]">
              No authors match "{query}"
            </li>
          )}

          {filtered.map((a, i) => (
            <li
              key={a._id}
              {...contentDirectionProps}
              className={`px-3 py-2 text-sm cursor-pointer ${
                i === active ? "bg-gray-100" : ""
              } ${a._id === value ? "font-bold" : ""}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                choose(a._id);
              }}
            >
              {a.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
