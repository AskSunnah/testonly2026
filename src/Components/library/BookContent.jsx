// src/Components/library/BookContent.jsx

import { useEffect, useRef, useState } from "react";

const TASHKEEL_REGEX = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export default function BookContent({
  blocks,
  references,
  fontSize,
  removeTashkeel,
  lang,
}) {
  const scrollRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setIsAtBottom(false);
    }
  }, [blocks]);

  // Detect overflow for fade indicator
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setIsScrollable(el.scrollHeight > el.clientHeight + 4);
      setIsAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    check();
    el.addEventListener("scroll", check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", check); ro.disconnect(); };
  }, [blocks, fontSize]);

  const cleanText = (text) =>
    removeTashkeel ? text.replace(TASHKEEL_REGEX, "") : text;

  const hasReferences = references && references.length > 0;

  return (
    <div
      className="flex flex-col w-full sm:w-[95%] md:w-[90%] lg:w-[85%]"
      style={{ height: "calc(100vh - 260px)" }}
    >
      {/* Book page — scrollable */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="
            h-full overflow-y-auto
            px-3 py-3 sm:px-5 sm:py-4 md:px-8 md:py-6
            text-[var(--text-main)]
            border border-double border-[var(--border-color)]
            text-justify break-words overflow-x-hidden
            [scrollbar-width:thin]
            [scrollbar-color:var(--border-color)_transparent]
          "
          style={{
            fontSize: `${fontSize}rem`,
            lineHeight: "2.1",
            background: 'url("/test1.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "local",
            borderRadius: "2% 2% 0 0",
          }}
        >
          {blocks.map((block, idx) => {
            switch (block.type) {
              case "heading":
                return (
                  <h3
                    key={idx}
                    className="font-bold mb-4 mt-5"
                    style={{ fontSize: `${fontSize * 1.15}rem`, lineHeight: "1.6" }}
                  >
                    {cleanText(block.text)}
                  </h3>
                );
              case "paragraph":
                return (
                  <p key={idx} className="whitespace-pre-wrap mb-4">
                    {cleanText(block.text)}
                  </p>
                );
              case "quote":
                return (
                  <blockquote
                    key={idx}
                    className="border-s-[3px] border-[var(--primary)] ps-3 sm:ps-4 text-[#1f6f3e] my-4 italic"
                  >
                    {cleanText(block.text)}
                    {block.reference && <p className="mt-1"><small>{block.reference}</small></p>}
                  </blockquote>
                );
              default:
                return (
                  <p key={idx} className="whitespace-pre-wrap mb-4">
                    {cleanText(block.text)}
                  </p>
                );
            }
          })}
        </div>

        {/* Fade overlay */}
        {isScrollable && !isAtBottom && (
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-16"
            style={{
              background: "linear-gradient(to bottom, transparent, rgba(234, 220, 180, 0.85))",
            }}
          />
        )}
      </div>

      {/* Reference zone */}
      <div
        className="shrink-0 h-[88px] border border-t-0 border-double border-[var(--border-color)] bg-[var(--bg-main)] overflow-hidden"
        style={{ borderRadius: "0 0 2% 2%" }}
      >
        {hasReferences ? (
          <div className="h-full overflow-y-auto px-3 sm:px-5 md:px-8 py-2 [scrollbar-width:thin]">
            <ul className="list-none p-0 m-0 space-y-1">
              {references.map((ref, i) => (
                <li key={i} className="text-[0.7rem] sm:text-xs text-[var(--text-secondary)] leading-snug">
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="h-full flex items-center px-3 sm:px-5 md:px-8">
            <div className="w-full h-px bg-[var(--border-color)] opacity-40" />
          </div>
        )}
      </div>
    </div>
  );
}