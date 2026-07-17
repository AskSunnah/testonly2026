// ── PreviewModal ─────────────────────────────────────────────────────────────
import React from "react";

export default function PreviewModal({ open, onClose, form, sections }) {
  if (!open) return null;

  const isRTL = form.language === "ar";
  const dir = isRTL ? "rtl" : "ltr";

  const labels = isRTL
    ? {
        question: "السؤال:",
        answer: "الجواب:",
        conclusion: "ملخص الجواب:",
        andAllahKnowsBest: "والله أعلم.",
        fromQuran: "من القرآن الكريم:",
        fromSunnah: "من السنة النبوية:",
        fromSalaf: "من السلف الصالح:",
        fromScholars: "من أقوال العلماء:",
      }
    : {
        question: "Question:",
        answer: "Answer:",
        conclusion: "Summary:",
        andAllahKnowsBest: "And Allah knows best.",
        fromQuran: "From the Qur'an:",
        fromSunnah: "From the Sunnah:",
        fromSalaf: "From the Salaf:",
        fromScholars: "From the Scholars:",
      };

  // Language-aware section title map
  const sectionTitleMap = {
    quran: labels.fromQuran,
    sunnah: labels.fromSunnah,
    salaf: labels.fromSalaf,
    scholar: labels.fromScholars,
    normal: "",
  };

  // Mirrors QuestionPage's renderTextWithRefs exactly
  const renderTextWithRefs = (text, key = 0) => {
    if (!text) return null;
    const parts = text.split(/({{[^}]+\|[^}]+}}|\[\[[^\]]+\|[^\]]+\]\])/g);
    return parts.map((part, i) => {
      const internal = part.match(/^{{(.+?)\|(.+?)}}$/);
      const external = part.match(/^\[\[(.+?)\|(.+?)\]\]$/);
      if (internal) {
        const [, slug, label] = internal;
        const href =
          form.language === "ar"
            ? `/ar/questions/${slug}`
            : `/questions/${slug}`;
        return (
          <a
            key={`${key}-${i}`}
            href={href}
            onClick={(e) => e.preventDefault()}
            className="text-[var(--bg-color-header)] underline underline-offset-2 font-medium hover:opacity-70 transition-opacity"
            title={`→ /questions/${slug}`}
          >
            {label}
          </a>
        );
      }
      if (external) {
        const [, url, label] = external;
        return (
          <a
            key={`${key}-${i}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--bg-color-header)] underline underline-offset-2 font-medium hover:opacity-70 transition-opacity"
          >
            {label}
          </a>
        );
      }
      return <span key={`${key}-${i}`}>{part}</span>;
    });
  };

  // Mirrors QuestionPage's renderAnswer exactly
  const renderAnswer = (text) => {
    if (!text) return null;
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const numberedHeadingRegex = /^\d+[\).]\s*/;
    const bulletRegex = /^[-•*]\s*/;
    const elements = [];
    let currentSection = null;

    lines.forEach((line) => {
      if (numberedHeadingRegex.test(line)) {
        if (currentSection) elements.push(currentSection);
        currentSection = {
          type: "section",
          heading: line.replace(numberedHeadingRegex, "").trim(),
          bullets: [],
        };
      } else if (bulletRegex.test(line)) {
        if (currentSection) {
          currentSection.bullets.push(line.replace(bulletRegex, "").trim());
        } else {
          elements.push({
            type: "ul",
            items: [line.replace(bulletRegex, "").trim()],
          });
        }
      } else {
        if (currentSection) {
          elements.push(currentSection);
          currentSection = null;
        }
        elements.push(line);
      }
    });
    if (currentSection) elements.push(currentSection);

    let counter = 1;
    return elements.map((el, idx) => {
      if (typeof el === "string") {
        return (
          <p key={idx} className="whitespace-pre-wrap leading-[1.7] mb-4">
            {renderTextWithRefs(el, idx)}
          </p>
        );
      }
      if (el.type === "section") {
        const n = counter++;
        return (
          <div key={idx} className="mb-6">
            <p className="text-[1.05em] font-medium mb-2">{`${n}. ${el.heading}`}</p>
            <ul className="pl-6">
              {el.bullets.map((b, i) => (
                <li key={i} className="leading-[1.7]">
                  {renderTextWithRefs(b, idx)}
                </li>
              ))}
            </ul>
          </div>
        );
      }
      if (el.type === "ul") {
        return (
          <ul key={idx} className="pl-6 list-disc mb-4">
            {el.items.map((item, i) => (
              <li key={i} className="leading-[1.7]">
                {renderTextWithRefs(item, idx)}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  return (
    <div
      className="fixed inset-0 z-[998] flex items-start justify-center bg-black/50 overflow-y-auto p-4 py-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* ↑ Wider modal: 860 → 1040 */}
      <div className="w-full max-w-[1040px] bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#f8fcf9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-color-header)] flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="m-0 text-[0.95rem] font-bold text-[var(--bg-color-header)]">
                Answer Preview
              </h3>
              <p className="m-0 text-[0.72rem] text-gray-400">
                Unsaved draft — this is how it will appear to users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                form.language === "ar"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-sky-100 text-sky-700"
              }`}
            >
              {form.language === "ar" ? "Arabic" : "English"}
            </span>
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
          </div>
        </div>

        {/* Preview body — mirrors QuestionPage layout exactly */}
        <div
          dir={dir}
          lang={form.language}
          className="px-10 py-8 text-[17px] max-h-[75vh] overflow-y-auto"
        >
          {/* Heading */}
          {form.title ? (
            <h1
              className={`text-[var(--bg-color-header)] text-[2rem] leading-[1.5] mb-5 font-bold ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              {form.title}
            </h1>
          ) : (
            <h1 className="text-gray-300 text-[2rem] leading-[1.5] mb-5 font-bold italic">
              {isRTL ? "لا عنوان بعد…" : "No title yet…"}
            </h1>
          )}

          {/* Question */}
          {form.question && (
            <p
              className={`mb-5 leading-[1.8] ${isRTL ? "text-right" : "text-left"}`}
            >
              <strong>{labels.question}</strong>{" "}
              <span>{form.question}</span>
            </p>
          )}

          {/* Conclusion / Summary box — same backdrop-filter as QuestionPage */}
          {form.conclusion && (
            <div className="mb-6">
              <h2 className="text-[1.05em] font-bold text-[#c3a421] mb-2">
                {labels.conclusion}
              </h2>
              <div
                className="p-5 rounded-2xl border-2 border-[rgba(195,164,33,0.5)] shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                style={{
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <p className="m-0 leading-[1.7] text-[#2b2b2b] whitespace-pre-wrap">
                  {renderTextWithRefs(form.conclusion, 0)}
                </p>
              </div>
            </div>
          )}

          {/* Answer */}
          {form.answer && (
            <div className="mb-6">
              <p
                className={`mb-4 leading-[1.8] ${isRTL ? "text-right" : "text-left"}`}
              >
                <strong>{labels.answer}</strong>
              </p>
              {renderAnswer(form.answer)}
            </div>
          )}

          {/* Dynamic content sections (Quran, Sunnah, Salaf, Scholars, Normal) */}
          {sections.map((section, idx) => {
            const sectionTitle = sectionTitleMap[section.type] || "";

            if (section.type === "normal") {
              return (
                <p key={idx} className="whitespace-pre-wrap leading-[1.7] mb-4">
                  {renderTextWithRefs(section.text, idx)}
                </p>
              );
            }

            const items = Array.isArray(section.items)
              ? section.items
              : [section];

            return (
              <div key={idx}>
                {sectionTitle && (
                  <h2
                    className={`text-[var(--bg-color-header)] mt-8 mb-4 text-[1.15em] font-bold ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    {sectionTitle}
                  </h2>
                )}
                <ul className="ps-5 list-disc">
                  {items.map((item, i) => (
                    <li key={i} className="mb-6">
                      {item.reference && (
                        <strong
                          className={`block mb-2 text-[0.9em] ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {item.reference}
                        </strong>
                      )}
                      {item.narrator && (
                        <em
                          className={`block mb-2 text-[0.875em] ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {item.narrator}
                        </em>
                      )}
                      <blockquote
                        className={`bg-[var(--bg-light)] border-s-[5px] border-[var(--bg-color-header)] my-5 px-5 py-4 italic mb-2 ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {renderTextWithRefs(item.text, idx)}
                      </blockquote>
                      {item.commentary && (
                        <p className="whitespace-pre-wrap leading-[1.7] mb-4">
                          {renderTextWithRefs(item.commentary, idx)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Divider + closing line — matches QuestionPage exactly */}
          <div className="h-px bg-[#c3a421] my-8 opacity-60" />
          <p>
            <strong>{labels.andAllahKnowsBest}</strong>
          </p>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-[#f8fcf9] flex items-center justify-between">
          <p className="text-xs text-gray-400 m-0 flex items-center gap-1.5">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Inline reference links are shown but won't navigate in preview mode
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}