import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  submitQA,
  submitStandaloneQA,
  editQA,
  getQA,
  getAllQuestions,
} from "../../api/qa";
import { getQACategories, createQACategory } from "../../api/qaCategories";
import AdminLayout from "../../Components/Admin/AdminLayout";
import PreviewModal from "../../Components/Admin/PreviewModal";
import { RxCross2 } from "react-icons/rx";

const sectionOptions = [
  { value: "quran", label: "From Quran" },
  { value: "sunnah", label: "From Sunnah" },
  { value: "scholar", label: "From Scholar" },
  { value: "salaf", label: "From Salaf" },
  { value: "normal", label: "Normal Text" },
];

// ── Insert Reference Modal ─────────────────────────────────────────────────
function InsertRefModal({ onInsert, onClose }) {
  const [slug, setSlug] = useState("");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [useUrl, setUseUrl] = useState(false);

  const handle = () => {
    if (!label.trim()) return;
    if (useUrl) {
      if (!url.trim()) return;
      onInsert(`[[${url.trim()}|${label.trim()}]]`);
    } else {
      if (!slug.trim()) return;
      onInsert(`{{${slug.trim()}|${label.trim()}}}`);
    }
    onClose();
  };

  const ready = label.trim() && (useUrl ? url.trim() : slug.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-7 w-[400px] max-w-[95vw]">
        <h3 className="text-[var(--bg-color-header)] text-[1.15rem] font-bold mb-4">
          Insert Inline Reference
        </h3>
        <div className="flex rounded-lg overflow-hidden border border-[#b5d4c3] mb-5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setUseUrl(false)}
            className={`flex-1 py-2 transition-colors ${!useUrl ? "bg-[var(--bg-color-header)] text-white" : "bg-[#f6f7fa] text-gray-500"}`}
          >
            Internal Question
          </button>
          <button
            type="button"
            onClick={() => setUseUrl(true)}
            className={`flex-1 py-2 transition-colors ${useUrl ? "bg-[var(--bg-color-header)] text-white" : "bg-[#f6f7fa] text-gray-500"}`}
          >
            Direct URL
          </button>
        </div>
        {!useUrl ? (
          <>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Question Slug
            </label>
            <input
              autoFocus
              className="w-full mb-4 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-sm"
              placeholder="e.g. ruling-on-music"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </>
        ) : (
          <>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Direct URL
            </label>
            <input
              autoFocus
              className="w-full mb-4 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-sm"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </>
        )}
        <label className="block text-sm font-semibold text-gray-600 mb-1">
          Display Text
        </label>
        <input
          className="w-full mb-2 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-sm"
          placeholder="e.g. our previous answer on this topic"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <p className="text-xs text-gray-400 mb-5 mt-2">
          This inserts a clickable link inline inside your answer text.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handle}
            disabled={!ready}
            className="px-4 py-2 rounded-lg bg-[var(--bg-color-header)] text-white text-sm font-semibold disabled:opacity-40"
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorModal({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[95vw] p-7 text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
          !
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Could not save Q&A
        </h3>
        <p className="text-slate-600 text-[0.95rem] leading-relaxed mb-6">
          {message || "Something went wrong. Please try again."}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="bg-red-600 text-white border-none rounded-xl px-6 py-3 font-semibold cursor-pointer hover:bg-red-700 transition-colors"
        >
          Okay
        </button>
      </div>
    </div>
  );
}

function RelatedModal({
  lang,
  currentSlug,
  selected,
  inlineSlugs = [],
  onSave,
  onClose,
}) {
  const [all, setAll] = useState([]);
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState(
    () => new Set(selected.map((r) => r.slug)),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllQuestions(lang)
      .then((data) => {
        setAll(data.filter((q) => q.slug !== currentSlug));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [lang, currentSlug]);

  const toggle = (slug) => {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleSave = () => {
    const result = all
      .filter((q) => checked.has(q.slug))
      .map((q) => ({ slug: q.slug, lang }));
    onSave(result);
    onClose();
  };

  const filtered = all.filter(
    (q) =>
      q.heading?.toLowerCase().includes(search.toLowerCase()) ||
      q.slug?.toLowerCase().includes(search.toLowerCase()),
  );

  const inlineItems = filtered.filter((q) => inlineSlugs.includes(q.slug));
  const regularItems = filtered.filter((q) => !inlineSlugs.includes(q.slug));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-w-[95vw] max-h-[85vh] flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-[var(--bg-color-header)] text-[1.15rem] font-bold mb-1">
            Select Related Answers
            <span className="ml-2 text-xs font-normal text-gray-400 uppercase tracking-wide">
              {lang === "ar" ? "Arabic" : "English"}
            </span>
          </h3>
          {inlineSlugs.length > 0 && (
            <p className="text-xs text-amber-600 mb-3 mt-1 font-medium">
              ✦ {inlineSlugs.length} question{inlineSlugs.length > 1 ? "s" : ""}{" "}
              detected from inline references — pre-selected below
            </p>
          )}
          <input
            autoFocus
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] px-3 py-2 text-sm"
          />
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              No questions found.
            </p>
          ) : (
            <>
              {inlineItems.length > 0 && (
                <>
                  <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2 mt-1">
                    Referenced inline in answer
                  </p>
                  {inlineItems.map((q) => (
                    <label
                      key={q.slug}
                      className={`flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer mb-1 transition-colors border border-amber-100 ${checked.has(q.slug) ? "bg-amber-50" : "hover:bg-amber-50/50"}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked.has(q.slug)}
                        onChange={() => toggle(q.slug)}
                        className="mt-[3px] accent-[var(--bg-color-header)] w-4 h-4 shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800 leading-snug m-0">
                          {q.heading}
                        </p>
                        <p className="text-xs text-gray-400 m-0 mt-[2px]">
                          {q.slug}
                        </p>
                      </div>
                    </label>
                  ))}
                  {regularItems.length > 0 && (
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">
                      All questions
                    </p>
                  )}
                </>
              )}
              {regularItems.map((q) => (
                <label
                  key={q.slug}
                  className={`flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer mb-1 transition-colors hover:bg-[rgba(40,115,70,0.05)] ${checked.has(q.slug) ? "bg-[rgba(40,115,70,0.07)]" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={checked.has(q.slug)}
                    onChange={() => toggle(q.slug)}
                    className="mt-[3px] accent-[var(--bg-color-header)] w-4 h-4 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-snug m-0">
                      {q.heading}
                    </p>
                    <p className="text-xs text-gray-400 m-0 mt-[2px]">
                      {q.slug}
                    </p>
                  </div>
                </label>
              ))}
            </>
          )}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">{checked.size} selected</span>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[var(--bg-color-header)] text-white text-sm font-semibold hover:opacity-90"
            >
              Save ({checked.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function flattenCategories(categories, level = 0) {
  return categories.flatMap((cat) => [
    {
      ...cat,
      level,
      displayName: `${"— ".repeat(level)}${cat.name}`,
    },
    ...flattenCategories(cat.children || [], level + 1),
  ]);
}

function QuickCreateCategoryModal({ lang, categories, onCreated, onClose }) {
  const [name, setName] = useState("");
  const [parent, setParent] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const flatCategories = flattenCategories(categories);
  const normalizeCategoryName = (value = "") =>
    value.trim().toLowerCase().replace(/\s+/g, " ");
  const handleCreate = async () => {
    if (!name.trim()) {
      setMsg("Please enter a category name.");
      return;
    }
    const duplicateExists = flatCategories.some((cat) => {
      const sameName =
        normalizeCategoryName(cat.name) === normalizeCategoryName(name);

      const sameParent =
        String(cat.parent?._id || cat.parent || "") === String(parent || "");

      return sameName && sameParent;
    });

    if (duplicateExists) {
      setMsg("This category already exists under the selected parent.");
      return;
    }
    try {
      setSaving(true);
      setMsg("");

      const created = await createQACategory({
        name,
        lang,
        parent: parent || null,
        description,
      });

      onCreated(created);
    } catch (err) {
      setMsg(err.message || "Could not create category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[460px] max-w-[95vw] p-7">
        <h3 className="text-xl font-bold text-slate-800 mb-1">
          Create Category
        </h3>
        <p className="text-sm text-slate-400 mt-0 mb-5">
          This will create a category and select it for this Q&amp;A.
        </p>

        {msg && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-700 border border-red-200 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        <label className="block text-sm font-bold text-slate-700 mb-1">
          Name
        </label>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={`w-full mb-4 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] ${
            lang === "ar" ? "text-right" : "text-left"
          }`}
        />

        <label className="block text-sm font-bold text-slate-700 mb-1">
          Parent Category
        </label>
        <select
          value={parent}
          onChange={(e) => setParent(e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421] bg-white"
        >
          <option value="">No parent — top level</option>
          {flatCategories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.displayName}
            </option>
          ))}
        </select>

        <label className="block text-sm font-bold text-slate-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          className="w-full mb-5 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#c3a421]"
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-[var(--bg-color-header)] text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create & Select"}
          </button>
        </div>
      </div>
    </div>
  );
}
function CategorySkeleton() {
  return (
    <div className="space-y-2 p-1">
      {[0, 18, 18, 0, 18].map((indent, i) => (
        <div
          key={i}
          className="flex items-center gap-2 py-1"
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="w-4 h-4 rounded bg-slate-200 animate-pulse shrink-0" />
          <div
            className="h-3 rounded bg-slate-200 animate-pulse"
            style={{ width: `${60 + (i % 3) * 25}px` }}
          />
        </div>
      ))}
    </div>
  );
}
function CategoryCheckboxNode({ cat, level, selected, onToggle, isArabic }) {
  const hasChildren = (cat.children || []).length > 0;
  const checked = selected.includes(cat._id);
  const indent = Math.min(level, 4) * 18;

  return (
    <div>
      <label
        title={cat.path}
        className={`flex items-center gap-2 rounded-lg px-2 py-2 sm:py-1.5 cursor-pointer transition ${
          checked ? "bg-white" : "hover:bg-white/60"
        }`}
        style={{ marginLeft: `${indent}px` }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(cat._id)}
          className="accent-[var(--bg-color-header)] w-4 h-4 shrink-0"
        />
        <span
          className={`text-sm truncate ${
            level === 0 ? "font-semibold text-gray-800" : "text-gray-600"
          }`}
          dir={isArabic ? "rtl" : "ltr"}
        >
          {cat.name}
        </span>
        {hasChildren && (
          <span className="text-[0.65rem] text-gray-400 ml-auto pl-2 shrink-0">
            {cat.children.length} sub{cat.children.length > 1 ? "s" : ""}
          </span>
        )}
      </label>

      {hasChildren &&
        cat.children.map((child) => (
          <CategoryCheckboxNode
            key={child._id}
            cat={child}
            level={level + 1}
            selected={selected}
            onToggle={onToggle}
            isArabic={isArabic}
          />
        ))}
    </div>
  );
}
// ── Main Component ─────────────────────────────────────────────────────────
export default function AddQA() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isEdit = searchParams.get("edit") === "1";
  const editSlug = searchParams.get("slug");
  const editLang = searchParams.get("lang");
  const questionId = searchParams.get("questionId"); // present when coming from UserQuestions
  const urlLang = searchParams.get("lang"); // en or ar — which answer type to write

  // If questionId present → linked mode. Otherwise → standalone mode.
  const isStandalone = !isEdit && !questionId;

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [relatedQuestions, setRelatedQuestions] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [showRefModal, setShowRefModal] = useState(false);
  const [showRelatedModal, setShowRelatedModal] = useState(false);
  const answerRef = useRef(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    language: urlLang || "en",
    title: "",
    slug: "",
    question: "",
    answer: "",
    conclusion: "",
  });

  const [message, setMessage] = useState("");
  const [selectedUserQuestionId, setSelectedUserQuestionId] = useState("");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const extractInlineSlugs = (text) => {
    const slugs = [];
    const internalMatches = [...text.matchAll(/{{([^|]+)\|[^}]+}}/g)];
    internalMatches.forEach((m) => slugs.push(m[1].trim()));
    const externalMatches = [...text.matchAll(/\[\[([^|]+)\|[^\]]+\]\]/g)];
    externalMatches.forEach((m) => {
      const url = m[1].trim();
      try {
        const parts = new URL(url).pathname.split("/").filter(Boolean);
        const slug = parts[parts.length - 1];
        if (slug) slugs.push(slug);
      } catch {}
    });
    return [...new Set(slugs)];
  };
  // Keeps a category if it matches the search term OR has a descendant that does,
  // so parents stay visible as context even if only a child matches.
  function filterCategoryTree(categories, term) {
    if (!term.trim()) return categories;
    const lower = term.trim().toLowerCase();

    return categories
      .map((cat) => {
        const children = filterCategoryTree(cat.children || [], term);
        const selfMatch = cat.name?.toLowerCase().includes(lower);

        if (selfMatch || children.length > 0) {
          return { ...cat, children };
        }
        return null;
      })
      .filter(Boolean);
  }
  const flatCategories = useMemo(
    () => flattenCategories(categoriesTree),
    [categoriesTree],
  );
  const filteredCategoryTree = useMemo(
    () => filterCategoryTree(categoriesTree, categorySearch),
    [categoriesTree, categorySearch],
  );
  useEffect(() => {
    let alive = true;
    setCategoriesLoading(true);

    getQACategories(form.language, false, true)
      .then((data) => {
        if (alive) setCategoriesTree(data);
      })
      .catch(() => {
        if (alive) setCategoriesTree([]);
      })
      .finally(() => {
        if (alive) setCategoriesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [form.language]);
  // Fetch for edit mode
  useEffect(() => {
    if (isEdit && editSlug && editLang) {
      setLoading(true);
      getQA(editSlug, editLang)
        .then((data) => {
          setForm({
            language: editLang,
            title: data.heading || "",
            slug: data.slug || "",
            question: data.question || "",
            answer: data.answer || "",
            conclusion: data.conclusion || "",
          });
          setSections(data.content || []);
          setRelatedQuestions(data.relatedQuestions || []);
          setSelectedCategories(
            (data.categories || []).map((cat) =>
              typeof cat === "string" ? cat : cat._id,
            ),
          );
          setLoading(false);
        })
        .catch(() => {
          setMessage("Failed to load.");
          setLoading(false);
        });
    }
  }, [isEdit, editSlug, editLang]);

  // Pre-fill from URL params when coming from UserQuestions
  useEffect(() => {
    if (isEdit) return;

    const urlQ = searchParams.get("question");
    const urlN = searchParams.get("name");
    const urlLangParam = searchParams.get("lang");
    const qId = searchParams.get("questionId");

    if (qId) setSelectedUserQuestionId(qId);

    if (urlQ) {
      setForm((p) => ({
        ...p,
        question: decodeURIComponent(urlQ).trim(),
        language: urlLangParam || "en",
      }));
    }

    if (urlN) {
      setMessage(`Answering question from: ${decodeURIComponent(urlN)}`);
    }
  }, [isEdit, searchParams]);

  // Auto-sync inline slugs into relatedQuestions
  useEffect(() => {
    if (!form.answer) return;
    const inlineSlugs = extractInlineSlugs(form.answer);
    if (!inlineSlugs.length) return;
    setRelatedQuestions((prev) => {
      const existingSlugs = new Set(prev.map((r) => r.slug));
      const toAdd = inlineSlugs
        .filter((s) => !existingSlugs.has(s))
        .map((s) => ({ slug: s, lang: form.language }));
      if (!toAdd.length) return prev;
      return [...prev, ...toAdd];
    });
  }, [form.answer]);

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleInsertRef = (token) => {
    const el = answerRef.current;
    if (!el) {
      setForm((f) => ({ ...f, answer: f.answer + token }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = form.answer.slice(0, start) + token + form.answer.slice(end);
    setForm((f) => ({ ...f, answer: next }));
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + token.length;
      el.focus();
    });
  };

  const handleSaveRelated = (newItems) => {
    setRelatedQuestions((prev) => {
      const otherLang = prev.filter((r) => r.lang !== form.language);
      return [...otherLang, ...newItems];
    });
  };

  // Section handlers
  const handleSectionInput = (idx, field, value, subidx = null) => {
    setSections((s) =>
      s.map((sec, i) => {
        if (i !== idx) return sec;
        if (field === "text" && sec.type === "normal")
          return { ...sec, text: value };
        if (subidx !== null) {
          const items = [...(sec.items || [])];
          items[subidx] = { ...items[subidx], [field]: value };
          return { ...sec, items };
        }
        return sec;
      }),
    );
  };
  const addSection = () => {
    const type = document.getElementById("section-type").value;
    setSections([
      ...sections,
      type === "normal" ? { type, text: "" } : { type, items: [{}] },
    ]);
  };
  const deleteSection = (idx) =>
    setSections((s) => s.filter((_, i) => i !== idx));
  const moveSection = (idx, dir) =>
    setSections((s) => {
      const a = [...s];
      const ni = idx + dir;
      if (ni < 0 || ni >= a.length) return a;
      [a[idx], a[ni]] = [a[ni], a[idx]];
      return a;
    });
  const addItem = (idx) =>
    setSections((s) =>
      s.map((sec, i) =>
        i !== idx ? sec : { ...sec, items: [...(sec.items || []), {}] },
      ),
    );
  const deleteItem = (idx, j) =>
    setSections((s) =>
      s.map((sec, i) =>
        i !== idx
          ? sec
          : { ...sec, items: sec.items.filter((_, k) => k !== j) },
      ),
    );

  const getAdminFriendlyError = (err) => {
    const msg = err?.message || "";
    if (msg.toLowerCase().includes("slug"))
      return "This slug is already used. Please choose a different slug.";
    if (msg.toLowerCase().includes("user question")) return msg;
    if (msg.toLowerCase().includes("title")) return "Please enter a title.";
    if (msg.toLowerCase().includes("question"))
      return "Please enter the question.";
    if (msg.toLowerCase().includes("answer")) return "Please enter the answer.";
    if (
      msg.toLowerCase().includes("summary") ||
      msg.toLowerCase().includes("conclusion")
    )
      return "Please enter the summary.";
    if (
      msg.toLowerCase().includes("network") ||
      msg.toLowerCase().includes("fetch")
    )
      return "Network error. Please check your connection and try again.";
    return msg || "Something went wrong while saving. Please try again.";
  };
  const isValidSlug = (slug) => {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  };

  const getSlugError = (slug) => {
    const trimmedSlug = slug.trim();

    if (!trimmedSlug) {
      return "Please enter a slug.";
    }

    if (trimmedSlug !== slug) {
      return "Slug cannot start or end with spaces.";
    }

    if (!isValidSlug(trimmedSlug)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens. Do not use spaces or symbols like ?, /, #, &, or =.";
    }

    return null;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const slugError = getSlugError(form.slug);

    if (slugError) {
      setErrorModalMessage(slugError);
      setErrorModalOpen(true);
      return;
    }

    setLoading(true);

    const qa = {
      title: form.title,
      slug: form.slug.trim(),
      question: form.question,
      answer: form.answer,
      conclusion: form.conclusion,
      content: sections,
      relatedQuestions,
      categories: selectedCategories,
      userQuestionId: selectedUserQuestionId,
      language: form.language,
    };

    try {
      if (isEdit) {
        await editQA(qa, editSlug, editLang);
        setMessage("Q&A updated successfully!");
      } else if (isStandalone) {
        // No linked user question
        await submitStandaloneQA(qa);
        setMessage("Q&A saved successfully!");
        setForm({
          language: form.language,
          title: "",
          slug: "",
          question: "",
          answer: "",
          conclusion: "",
        });
        setSections([]);
        setRelatedQuestions([]);
        setSelectedCategories([]);
      } else {
        // Linked to a user question — lang determines which status to flip
        await submitQA(qa, form.language);
        setMessage("Q&A saved and status updated!");
        navigate("/user-questions");
      }
    } catch (err) {
      setErrorModalMessage(getAdminFriendlyError(err));
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const fieldCls =
    "w-full mb-4 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-base box-border";
  const labelCls =
    "mt-2 mb-[3px] block text-[var(--bg-color-header)] text-[17px] font-bold";
  const isArabic = form.language === "ar";

  const contentDirectionProps = isArabic
    ? { dir: "rtl", lang: "ar" }
    : { dir: "ltr", lang: "en" };

  const contentFieldCls = `${fieldCls} ${isArabic ? "text-right leading-8" : "text-left"}`;
  const slugFieldCls = `${fieldCls} text-left`;
  // Determine page title and mode banner
  const pageTitle = isEdit
    ? "Edit Q&A"
    : isStandalone
      ? "Add Standalone Q&A"
      : `Add ${form.language === "ar" ? "Arabic" : "English"} Answer`;

  return (
    <AdminLayout>
      <ErrorModal
        open={errorModalOpen}
        message={errorModalMessage}
        onClose={() => {
          setErrorModalOpen(false);
          setErrorModalMessage("");
        }}
      />
      {showRefModal && (
        <InsertRefModal
          onInsert={handleInsertRef}
          onClose={() => setShowRefModal(false)}
        />
      )}
      {showRelatedModal && (
        <RelatedModal
          lang={form.language}
          currentSlug={editSlug || ""}
          selected={relatedQuestions}
          inlineSlugs={extractInlineSlugs(form.answer)}
          onSave={handleSaveRelated}
          onClose={() => setShowRelatedModal(false)}
        />
      )}
      {!isEdit && showCreateCategoryModal && (
        <QuickCreateCategoryModal
          lang={form.language}
          categories={categoriesTree}
          onClose={() => setShowCreateCategoryModal(false)}
          onCreated={(created) => {
            setShowCreateCategoryModal(false);

            getQACategories(form.language, false, true)
              .then(setCategoriesTree)
              .catch(() => {});

            setSelectedCategories((prev) =>
              prev.includes(created._id) ? prev : [...prev, created._id],
            );
          }}
        />
      )}
      {showPreview && (
        <PreviewModal
          open={showPreview}
          onClose={() => setShowPreview(false)}
          form={form}
          sections={sections}
        />
      )}
      <div className="font-[Segoe_UI,sans-serif] bg-white max-w-[750px] mt-12 mx-auto rounded-[1.4rem] shadow-[0_6px_24px_rgba(40,115,70,0.12)] px-10 py-8">
        <h2 className="text-center text-[var(--bg-color-header)] text-[2rem] mb-2 font-[Montserrat,Arial,sans-serif]">
          {pageTitle}
        </h2>

        {/* Mode banner */}
        {!isEdit && (
          <div
            className={`text-center text-xs font-semibold px-3 py-2 rounded-lg mb-5 ${
              isStandalone
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : form.language === "ar"
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {isStandalone
              ? "Standalone — this answer has no linked user question"
              : `Answering in ${form.language === "ar" ? "Arabic" : "English"} — this will mark the ${form.language === "ar" ? "Arabic" : "English"} status as answered`}
          </div>
        )}

        {loading && !form.title ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} autoComplete="off">
            {/* Language selector — shown in standalone and edit modes only */}
            {(isStandalone || isEdit) && (
              <>
                <label className={labelCls}>Answer Language:</label>
                <select
                  name="language"
                  value={form.language}
                  onChange={handleInput}
                  required
                  className={fieldCls}
                >
                  <option value="en">English</option>
                  <option value="ar">Arabic</option>
                </select>
              </>
            )}

            <label className={labelCls}>Title:</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleInput}
              required
              {...contentDirectionProps}
              className={contentFieldCls}
            />

            <label className={labelCls}>Slug:</label>
            <input
              type="text"
              name="slug"
              value={form.slug}
              onChange={(e) => {
                const value = e.target.value.toLowerCase();
                setForm({ ...form, slug: value });
              }}
              required
              placeholder="example: ruling-on-music"
              dir="ltr"
              lang="en"
              className={slugFieldCls}
            />
            <p className="text-xs text-gray-400 mt-[-10px] mb-4">
              Use only lowercase letters, numbers, and hyphens. No spaces or
              symbols.
            </p>
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div>
                  <label className={labelCls}>Categories:</label>
                  <p className="text-xs text-gray-400 mt-[-2px] mb-0">
                    {isEdit
                      ? "Assign or reassign existing categories for this Q&A."
                      : "Select one or more categories, or create a new category if needed."}
                  </p>
                </div>

                {!isEdit && (
                  <button
                    type="button"
                    onClick={() => setShowCreateCategoryModal(true)}
                    className="text-xs px-3 py-1 rounded-full border border-[var(--bg-color-header)] text-[var(--bg-color-header)] hover:bg-[var(--bg-color-header)] hover:text-white transition-colors duration-150 font-semibold shrink-0"
                  >
                    + Create Category
                  </button>
                )}
              </div>

              {categoriesLoading ? (
                <div className="rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-3">
                  <CategorySkeleton />
                </div>
              ) : flatCategories.length === 0 ? (
                <div className="rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-3">
                  <p className="text-sm text-gray-400 m-0">
                    No categories found for this language. Create one first.
                  </p>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full mb-2 rounded-lg border border-[#b5d4c3] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--bg-color-header)]"
                  />

                  <div className="rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-2 max-h-64 overflow-y-auto">
                    {filteredCategoryTree.length === 0 ? (
                      <p className="text-sm text-gray-400 m-0 py-2 text-center">
                        No categories match "{categorySearch}".
                      </p>
                    ) : (
                      filteredCategoryTree.map((cat) => (
                        <CategoryCheckboxNode
                          key={cat._id}
                          cat={cat}
                          level={0}
                          selected={selectedCategories}
                          isArabic={isArabic}
                          onToggle={(id) => {
                            setSelectedCategories((prev) =>
                              prev.includes(id)
                                ? prev.filter((cid) => cid !== id)
                                : [...prev, id],
                            );
                          }}
                        />
                      ))
                    )}
                  </div>
                </>
              )}

              {selectedCategories.length > 0 && (
                <p className="text-xs text-gray-400 mt-2 mb-0">
                  {selectedCategories.length} categor
                  {selectedCategories.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>
            <label className={labelCls}>Question:</label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleInput}
              required
              {...contentDirectionProps}
              className={`${contentFieldCls} min-h-[62px]`}
            />

            <div className="flex items-center justify-between mt-2 mb-[3px]">
              <span className="text-[var(--bg-color-header)] text-[17px] font-bold">
                Answer:
              </span>
              <button
                type="button"
                onClick={() => setShowRefModal(true)}
                className="text-xs px-3 py-1 rounded-full border border-[var(--bg-color-header)] text-[var(--bg-color-header)] hover:bg-[var(--bg-color-header)] hover:text-white transition-colors duration-150 font-semibold"
              >
                + Insert Reference
              </button>
            </div>
            <textarea
              ref={answerRef}
              name="answer"
              value={form.answer}
              onChange={handleInput}
              required
              {...contentDirectionProps}
              className={`${contentFieldCls} min-h-[62px]`}
            />

            <hr className="my-[18px]" />

            {/* Dynamic sections */}
            <div>
              {sections.map((section, idx) =>
                section.type === "normal" ? (
                  <div
                    key={idx}
                    className="border border-[#cfe7d8] rounded-[10px] mb-[18px] bg-white p-4"
                  >
                    <label className={labelCls}>
                      {section.type.toUpperCase()}
                    </label>
                    <textarea
                      required
                      placeholder="Text"
                      value={section.text || ""}
                      onChange={(e) =>
                        handleSectionInput(idx, "text", e.target.value)
                      }
                      {...contentDirectionProps}
                      className={`${contentFieldCls} min-h-[62px]`}
                    />
                    <div className="mt-[9px] flex gap-[7px]">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        className="border border-gray-500 bg-white text-[var(--bg-color-header)] text-base py-[6px] px-3 rounded-[7px] cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        className="border border-gray-500 bg-white text-[var(--bg-color-header)] text-base py-[6px] px-3 rounded-[7px] cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(idx)}
                        className="border border-gray-500 bg-white text-[var(--bg-color-header)] text-base py-[6px] px-3 rounded-[7px] cursor-pointer"
                      >
                        Delete Section
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    className="border border-[#cfe7d8] rounded-[10px] mb-[18px] bg-white p-4"
                  >
                    <label className={labelCls}>
                      {section.type.toUpperCase()}
                    </label>
                    {(section.items || []).map((item, subidx) => (
                      <div
                        key={subidx}
                        className="border-b border-[#e5e9ec] mb-[9px] pb-[7px] last:border-0"
                      >
                        <input
                          type="text"
                          placeholder="Reference"
                          value={item.reference || ""}
                          required
                          onChange={(e) =>
                            handleSectionInput(
                              idx,
                              "reference",
                              e.target.value,
                              subidx,
                            )
                          }
                          {...contentDirectionProps}
                          className={contentFieldCls}
                        />
                        {section.type === "sunnah" && (
                          <input
                            type="text"
                            placeholder="Narrator"
                            value={item.narrator || ""}
                            onChange={(e) =>
                              handleSectionInput(
                                idx,
                                "narrator",
                                e.target.value,
                                subidx,
                              )
                            }
                            {...contentDirectionProps}
                            className={contentFieldCls}
                          />
                        )}
                        <textarea
                          placeholder="Text"
                          value={item.text || ""}
                          onChange={(e) =>
                            handleSectionInput(
                              idx,
                              "text",
                              e.target.value,
                              subidx,
                            )
                          }
                          {...contentDirectionProps}
                          className={`${contentFieldCls} min-h-[62px]`}
                        />
                        <textarea
                          placeholder="Commentary"
                          value={item.commentary || ""}
                          onChange={(e) =>
                            handleSectionInput(
                              idx,
                              "commentary",
                              e.target.value,
                              subidx,
                            )
                          }
                          {...contentDirectionProps}
                          className={`${contentFieldCls} min-h-[62px]`}
                        />
                        <button
                          type="button"
                          onClick={() => deleteItem(idx, subidx)}
                          className="px-[22px] py-[10px] bg-[#c3a421] text-white rounded-[7px] cursor-pointer font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addItem(idx)}
                      className="px-[22px] py-[10px] bg-[#c3a421] text-white rounded-[7px] cursor-pointer font-semibold"
                    >
                      Add {section.type} Entry
                    </button>
                    <div className="mt-[9px] flex gap-[7px]">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, -1)}
                        className="border border-gray-500 bg-white text-[var(--bg-color-header)] text-base py-[6px] px-3 rounded-[7px] cursor-pointer"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 1)}
                        className="border border-gray-500 bg-white text-[var(--bg-color-header)] text-base py-[6px] px-3 rounded-[7px] cursor-pointer"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSection(idx)}
                        className="px-[22px] py-[10px] bg-[#c3a421] text-white rounded-[7px] cursor-pointer font-semibold"
                      >
                        Delete Section
                      </button>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="flex gap-3 items-center mb-5">
              <select
                id="section-type"
                className="flex-1 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-base min-w-[120px]"
              >
                {sectionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addSection}
                className="bg-[var(--bg-color-header)] text-white border-none rounded-lg py-[13px] px-[18px] text-base cursor-pointer mt-[-7px]"
              >
                Add Section
              </button>
            </div>

            <label className={labelCls}>Summary:</label>
            <textarea
              name="conclusion"
              value={form.conclusion}
              onChange={handleInput}
              required
              {...contentDirectionProps}
              className={`${contentFieldCls} min-h-[62px]`}
            />
            <hr className="my-[18px]" />

            {/* Related Answers */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-[var(--bg-color-header)] text-[17px] font-bold m-0">
                    Related Answers
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 m-0">
                    Showing {form.language === "ar" ? "Arabic" : "English"}{" "}
                    questions — change language above to switch
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRelatedModal(true)}
                  className="text-sm px-4 py-2 rounded-lg bg-[var(--bg-color-header)] text-white font-semibold hover:opacity-85 transition-opacity"
                >
                  Browse & Select
                </button>
              </div>
              {relatedQuestions.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-3 text-center border border-dashed border-gray-200 rounded-lg">
                  No related answers selected yet
                </p>
              ) : (
                <ul className="m-0 p-0 list-none space-y-2">
                  {relatedQuestions.map((rq, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-[#cfe7d8] bg-[#f8fcf9]"
                    >
                      <div>
                        <p className="m-0 text-sm font-semibold text-gray-700">
                          {rq.slug}
                        </p>
                        <p className="m-0 text-xs text-gray-400 mt-[2px] uppercase tracking-wide">
                          {rq.lang}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setRelatedQuestions((r) =>
                            r.filter((_, idx) => idx !== i),
                          )
                        }
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg px-1 cursor-pointer"
                      >
                        <RxCross2 />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-3 mt-[9px]">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex-1 flex items-center justify-center gap-2 border border-[var(--bg-color-header)] text-[var(--bg-color-header)] bg-white rounded-[10px] py-[13px] text-[1.05rem] font-bold hover:bg-[rgba(40,115,70,0.05)] transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                Preview
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[var(--bg-color-header)] text-white border-none rounded-[10px] py-[13px] text-[1.16rem] font-bold cursor-pointer disabled:opacity-60"
              >
                {loading ? "Saving..." : isEdit ? "Update Q&A" : "Save Q&A"}
              </button>
            </div>
          </form>
        )}

        <div
          className="text-center mt-4 min-h-[18px] font-semibold"
          style={{
            color:
              message.includes("saved") || message.includes("updated")
                ? "#287346"
                : "#b71010",
          }}
        >
          {message}
        </div>
      </div>
    </AdminLayout>
  );
}
