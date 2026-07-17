import { useState, useEffect } from "react";
import { getAllQuestions } from "../../api/qa";
import AdminLayout from "../../Components/Admin/AdminLayout";
import { API_BASE } from "../../../config";
import {
  Pin,
  PinOff,
  Search,
  X,
  Check,
  AlertCircle,
  CalendarClock,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────
// Preset section types, keyed by language. Picking a pill sets the
// title directly for that language — there's no separate "type" step
// and "title" step, the pill IS the title. "Other" reveals a text
// input for a custom title in that same language.
// ─────────────────────────────────────────────────────────────────
const PRESETS = {
  en: [
    { value: "answers_of_the_week", label: "Answers of the week" },
    { value: "answers_of_the_month", label: "Answers of the month" },
    { value: "editors_pick", label: "Editor's pick" },
    { value: "trending_now", label: "Trending now" },
    { value: "ramadan_specials", label: "Ramadan specials" },
    { value: "hajj_specials", label: "Hajj & Umrah specials" },
    { value: "custom", label: "Other…" },
  ],
  ar: [
    { value: "answers_of_the_week", label: "أجوبة الأسبوع" },
    { value: "answers_of_the_month", label: "أجوبة الشهر" },
    { value: "editors_pick", label: "اختيار المحرر" },
    { value: "trending_now", label: "الأكثر تداولاً" },
    { value: "ramadan_specials", label: "خاص بشهر رمضان" },
    { value: "hajj_specials", label: "خاص بالحج والعمرة" },
    { value: "custom", label: "أخرى…" },
  ],
};

const emptyForm = {
  lang: "both",
  en: { preset: "answers_of_the_week", customTitle: "" },
  ar: { preset: "answers_of_the_week", customTitle: "" },
  expiryEnabled: false,
  expiresAt: "",
};

// ─────────────────────────────────────────────────────────────────
// Question picker modal
// ─────────────────────────────────────────────────────────────────
function QuestionPickerModal({ selected, onSave, onClose }) {
  const [englishAll, setEnglishAll] = useState([]);
  const [arabicAll, setArabicAll] = useState([]);
  const [search, setSearch] = useState("");
  const [langTab, setLangTab] = useState("en");
  const [checked, setChecked] = useState(
    () => new Set(selected.map((q) => `${q.lang}:${q.slug}`))
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAllQuestions("en"), getAllQuestions("ar")])
      .then(([en, ar]) => {
        setEnglishAll(en);
        setArabicAll(ar);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggle = (slug, lang) => {
    const key = `${lang}:${slug}`;
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSave = () => {
    // Look heading up from whichever pool it belongs to, so the form's
    // selected-questions list can show real titles instead of slugs.
    const result = [];
    for (const key of checked) {
      const [lang, slug] = key.split(/:(.+)/); // split on first colon only
      const pool = lang === "ar" ? arabicAll : englishAll;
      const match = pool.find((q) => q.slug === slug);
      result.push({ slug, lang, heading: match?.heading || slug });
    }
    onSave(result);
    onClose();
  };

  const pool = langTab === "en" ? englishAll : arabicAll;
  const term = search.trim().toLowerCase();
  const filtered = term
    ? pool.filter(
        (q) =>
          q.heading?.toLowerCase().includes(term) ||
          q.slug?.toLowerCase().includes(term)
      )
    : pool;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-w-[95vw] max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h3 className="text-[var(--bg-color-header)] text-[1.15rem] font-bold mb-3">
            Select questions to pin
          </h3>

          {/* Language tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[#b5d4c3] mb-4 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setLangTab("en")}
              className={`flex-1 py-2 transition-colors ${
                langTab === "en"
                  ? "bg-[var(--bg-color-header)] text-white"
                  : "bg-[#f6f7fa] text-gray-500"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLangTab("ar")}
              className={`flex-1 py-2 transition-colors ${
                langTab === "ar"
                  ? "bg-[var(--bg-color-header)] text-white"
                  : "bg-[#f6f7fa] text-gray-500"
              }`}
            >
              Arabic
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {loading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No questions found.</p>
          ) : (
            filtered.map((q) => {
              const key = `${langTab}:${q.slug}`;
              const isChecked = checked.has(key);
              return (
                <label
                  key={q.slug}
                  className={`flex items-start gap-3 py-3 px-3 rounded-lg cursor-pointer mb-1 transition-colors ${
                    isChecked ? "bg-[rgba(40,115,70,0.07)]" : "hover:bg-[rgba(40,115,70,0.04)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(q.slug, langTab)}
                    className="mt-[3px] accent-[var(--bg-color-header)] w-4 h-4 shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 leading-snug m-0">{q.heading}</p>
                    <p className="text-xs text-gray-400 m-0 mt-[2px]">{q.slug}</p>
                  </div>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
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

// ─────────────────────────────────────────────────────────────────
// List view — shows every section (active + inactive)
// ─────────────────────────────────────────────────────────────────
function SectionsList({ sections, loading, onCreateNew, onEdit, onToggle, onDelete, busyId }) {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-[1.85rem] font-bold text-slate-800 m-0 flex items-center gap-2.5">
            <Pin size={24} className="text-[#c3a421]" />
            Pinned sections
          </h1>
          <p className="text-[0.95rem] text-slate-500 mt-1 mb-0">
            Multiple sections can be active at once — e.g. one for English, a different
            one for Arabic, or several running together.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-color-header)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New pinned section
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[88px] rounded-xl bg-[#f3f4f6] animate-pulse" />
          ))}
        </div>
      ) : sections.length === 0 ? (
        <div className="py-12 rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-sm">
          No pinned sections yet — click "New pinned section" to create one.
        </div>
      ) : (
        <ul className="space-y-3 m-0 p-0 list-none">
          {sections.map((s) => {
            const isBusy = busyId === s._id;
            const expired = s.expiresAt && new Date(s.expiresAt) < new Date();

            // Only show the title(s) for whichever language(s) this
            // section actually targets. Sections saved as "en" or "ar"
            // only get one title shown, even though the schema mirrors
            // the same text into both title.en/title.ar under the hood.
            const showEn = s.lang === "en" || s.lang === "both";
            const showAr = s.lang === "ar" || s.lang === "both";

            return (
              <li
                key={s._id}
                className={`px-5 py-4 rounded-xl border flex items-center justify-between gap-4 flex-wrap ${
                  s.isActive ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {showEn && (
                      <strong className="font-bold text-slate-800">{s.title?.en}</strong>
                    )}
                    {showAr && s.title?.ar && (
                      <span dir="rtl" className="text-slate-500 font-medium">
                        {s.title.ar}
                      </span>
                    )}
                    <span
                      className={`text-[0.7rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {s.isActive ? (expired ? "Expired" : "Active") : "Inactive"}
                    </span>
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[rgba(195,164,33,0.15)] text-[#8a7012]">
                      {s.lang === "both" ? "EN + AR" : s.lang.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 mb-0">
                    {s.questions?.length || 0} question{s.questions?.length !== 1 ? "s" : ""} pinned
                    {s.expiresAt && (
                      <span className="ml-2 text-amber-700">
                        · expires{" "}
                        {new Date(s.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onEdit(s)}
                    disabled={isBusy}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => onToggle(s)}
                    disabled={isBusy}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-50 ${
                      s.isActive
                        ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {s.isActive ? <PinOff size={14} /> : <Pin size={14} />}
                    {s.isActive ? "Unpublish" : "Reactivate"}
                  </button>
                  <button
                    onClick={() => onDelete(s)}
                    disabled={isBusy}
                    title="Delete permanently"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Create / edit form
// ─────────────────────────────────────────────────────────────────
function SectionForm({ editingSection, onBack, onSaved, token }) {
  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });

  useEffect(() => {
    if (!editingSection) {
      setForm(emptyForm);
      setQuestions([]);
      return;
    }
    const matched = PRESETS.en.find((p) => p.value === editingSection.type);
    setForm({
      lang: editingSection.lang,
      en: {
        preset: matched ? editingSection.type : "custom",
        customTitle: !matched ? editingSection.title?.en || "" : "",
      },
      ar: {
        preset: matched ? editingSection.type : "custom",
        customTitle: !matched ? editingSection.title?.ar || "" : "",
      },
      expiryEnabled: !!editingSection.expiresAt,
      expiresAt: editingSection.expiresAt
        ? new Date(editingSection.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    // Existing sections saved before this change won't have `heading` on
    // their question entries yet — fall back to the slug so the list still
    // renders something sensible until the admin re-saves via the picker.
    setQuestions(
      (editingSection.questions || []).map((q) => ({
        ...q,
        heading: q.heading || q.slug,
      }))
    );
  }, [editingSection]);

  // Resolve the actual title text for a language: preset label if a
  // preset pill is selected, or the typed custom text if "Other" is picked.
  const resolveTitle = (langKey) => {
    const { preset, customTitle } = form[langKey];
    if (preset === "custom") return customTitle.trim();
    return PRESETS[langKey].find((p) => p.value === preset)?.label || "";
  };

  const resolvedTitleEn = resolveTitle("en");
  const resolvedTitleAr = resolveTitle("ar");

  const setLangField = (langKey, patch) =>
    setForm((f) => ({ ...f, [langKey]: { ...f[langKey], ...patch } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const needsEn = form.lang === "en" || form.lang === "both";
    const needsAr = form.lang === "ar" || form.lang === "both";

    if (needsEn && !resolvedTitleEn) {
      setMsg({ text: "Please enter an English title.", ok: false });
      return;
    }
    if (needsAr && !resolvedTitleAr) {
      setMsg({ text: "Please enter an Arabic title.", ok: false });
      return;
    }
    if (questions.length === 0) {
      setMsg({ text: "Please select at least one question.", ok: false });
      return;
    }

    setSaving(true);
    setMsg({ text: "", ok: true });

    try {
      const body = {
        // Only persist the title(s) that are actually in scope for this
        // section's language. We previously mirrored whichever title was
        // filled into both en/ar slots — that's what caused single-language
        // sections to display both an English and an Arabic title in the
        // admin list. Now an "en"-only or "ar"-only section stores just
        // that one field; the unused slot is left empty.
        title: {
          en: needsEn ? resolvedTitleEn : "",
          ar: needsAr ? resolvedTitleAr : "",
        },
        type: needsEn ? form.en.preset : form.ar.preset,
        lang: form.lang,
        questions,
        expiresAt: form.expiryEnabled && form.expiresAt ? form.expiresAt : null,
      };

      const isEdit = !!editingSection;
      const url = isEdit
        ? `${API_BASE}/api/admin/pinned/${editingSection._id}`
        : `${API_BASE}/api/admin/pinned`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save.");

      onSaved(isEdit ? "Pinned section updated successfully." : "Pinned section published successfully.");
    } catch (err) {
      setMsg({ text: err.message || "Something went wrong.", ok: false });
      setSaving(false);
    }
  };

  const removeQuestion = (idx) => setQuestions((prev) => prev.filter((_, i) => i !== idx));

  const fieldCls = "w-full rounded-lg border border-[#b5d4c3] bg-[#f6f7fa] p-[10px] text-base";
  const labelCls = "block text-[var(--bg-color-header)] text-[15px] font-bold mt-4 mb-1";

  return (
    <div>
      {showPicker && (
        <QuestionPickerModal
          selected={questions}
          onSave={setQuestions}
          onClose={() => setShowPicker(false)}
        />
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700 mb-4"
      >
        <ArrowLeft size={15} />
        Back to all sections
      </button>

      <h1 className="text-[1.6rem] font-bold text-slate-800 m-0 mb-1 flex items-center gap-2.5">
        <Pin size={20} className="text-[#c3a421]" />
        {editingSection ? "Edit pinned section" : "New pinned section"}
      </h1>
      <p className="text-[0.9rem] text-slate-500 mb-6">
        {editingSection
          ? "Changes apply immediately once saved."
          : "This will go live as soon as you publish it."}
      </p>

      {msg.text && (
        <div
          className={`mb-5 px-4 py-2.5 rounded-xl text-sm font-medium border ${
            msg.ok
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 px-8 py-7">
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Language — comes first, since it decides what's shown below */}
          <label className={labelCls}>Show on</label>
          <div className="flex rounded-xl overflow-hidden border border-[#b5d4c3] max-w-[420px] mb-1">
            {[
              { value: "both", label: "Both homepages" },
              { value: "en", label: "English only" },
              { value: "ar", label: "Arabic only" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, lang: opt.value }))}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  form.lang === opt.value
                    ? "bg-[var(--bg-color-header)] text-white"
                    : "bg-[#f6f7fa] text-gray-500 hover:bg-[#eef0f2]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {form.lang === "both" && (
            <p className="text-xs text-gray-400 mt-1.5 mb-0">
              Set a title for each homepage below. When you pick questions, English
              ones will show under the English title, Arabic ones under the Arabic title.
            </p>
          )}

          {/* English title block — pills double as the title picker */}
          {(form.lang === "en" || form.lang === "both") && (
            <>
              <label className={labelCls}>English section title</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                {PRESETS.en.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setLangField("en", { preset: p.value })}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold text-left transition-all ${
                      form.en.preset === p.value
                        ? "bg-[var(--bg-color-header)] text-white border-[var(--bg-color-header)]"
                        : "bg-[#f6f7fa] text-gray-600 border-[#b5d4c3] hover:border-[var(--bg-color-header)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {form.en.preset === "custom" && (
                <input
                  type="text"
                  placeholder='e.g. "New Muslim essentials"'
                  value={form.en.customTitle}
                  onChange={(e) => setLangField("en", { customTitle: e.target.value })}
                  className={fieldCls}
                />
              )}
            </>
          )}

          {/* Arabic title block — pills double as the title picker */}
          {(form.lang === "ar" || form.lang === "both") && (
            <>
              <label className={labelCls}>العنوان بالعربية</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2" dir="rtl">
                {PRESETS.ar.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setLangField("ar", { preset: p.value })}
                    className={`px-3 py-2.5 rounded-xl border text-sm font-semibold text-right transition-all ${
                      form.ar.preset === p.value
                        ? "bg-[var(--bg-color-header)] text-white border-[var(--bg-color-header)]"
                        : "bg-[#f6f7fa] text-gray-600 border-[#b5d4c3] hover:border-[var(--bg-color-header)]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {form.ar.preset === "custom" && (
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: أساسيات للمسلم الجديد"
                  value={form.ar.customTitle}
                  onChange={(e) => setLangField("ar", { customTitle: e.target.value })}
                  className={`${fieldCls} text-right`}
                />
              )}
            </>
          )}

          {/* Expiry */}
          <label className={labelCls}>
            <span className="flex items-center gap-2">
              <CalendarClock size={16} />
              Auto-expire
            </span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={form.expiryEnabled}
              onChange={(e) => setForm((f) => ({ ...f, expiryEnabled: e.target.checked }))}
              className="accent-[var(--bg-color-header)] w-4 h-4"
            />
            <span className="text-sm text-gray-600">Automatically unpublish after a date</span>
          </label>
          {form.expiryEnabled && (
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className={`${fieldCls} max-w-[280px]`}
            />
          )}

          {/* Questions */}
          <div className="mt-6 mb-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[var(--bg-color-header)] text-[15px] font-bold m-0">
                  Pinned questions
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 m-0">{questions.length} selected</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                className="text-sm px-4 py-2 rounded-lg bg-[var(--bg-color-header)] text-white font-semibold hover:opacity-85"
              >
                Browse &amp; select
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="py-8 rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-400 text-sm">
                No questions selected yet — click "Browse &amp; select" above
              </div>
            ) : (
              <ul className="space-y-2 m-0 p-0 list-none">
                {questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#cfe7d8] bg-[#f8fcf9]"
                  >
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-semibold text-gray-700 leading-snug line-clamp-1">
                        {q.heading || q.slug}
                      </p>
                      <p className="m-0 text-xs text-gray-400 mt-[2px] flex items-center gap-1.5">
                        <span className="uppercase tracking-wide">{q.lang}</span>
                        <span className="text-gray-300">·</span>
                        <span className="truncate">{q.slug}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(i)}
                      className="shrink-0 text-gray-400 hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full bg-[var(--bg-color-header)] text-white rounded-xl py-3.5 font-bold text-[1rem] flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            <Pin size={18} />
            {saving ? "Saving…" : editingSection ? "Save changes" : "Publish pinned section"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main page — switches between list view and create/edit form
// ─────────────────────────────────────────────────────────────────
export default function PinnedSectionPage() {
  const [view, setView] = useState("list"); // "list" | "form"
  const [sections, setSections] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [listMsg, setListMsg] = useState({ text: "", ok: true });

  const token = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const loadSections = () => {
    setLoadingList(true);
    fetch(`${API_BASE}/api/admin/pinned/all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setSections(data.success ? data.sections : []))
      .catch(() => setSections([]))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleCreateNew = () => {
    setEditingSection(null);
    setView("form");
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setView("form");
  };

  const handleSaved = (successText) => {
    setView("list");
    setListMsg({ text: successText, ok: true });
    loadSections();
  };

  const handleToggle = async (section) => {
    setBusyId(section._id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pinned/${section._id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      await loadSections();
      setListMsg({
        text: section.isActive
          ? "Pinned section removed from the homepage."
          : "Pinned section reactivated.",
        ok: true,
      });
    } catch {
      setListMsg({ text: "Failed to update section.", ok: false });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (section) => {
    const name = section.title?.en || section.title?.ar || "this section";
    if (!window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;

    setBusyId(section._id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pinned/${section._id}/destroy`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      await loadSections();
      setListMsg({ text: "Pinned section deleted permanently.", ok: true });
    } catch {
      setListMsg({ text: "Failed to delete section.", ok: false });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[860px] mx-auto mt-10 px-4">
        {listMsg.text && view === "list" && (
          <div
            className={`mb-5 px-4 py-2.5 rounded-xl text-sm font-medium border ${
              listMsg.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {listMsg.text}
          </div>
        )}

        {view === "list" ? (
          <SectionsList
            sections={sections}
            loading={loadingList}
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            busyId={busyId}
          />
        ) : (
          <SectionForm
            editingSection={editingSection}
            onBack={() => setView("list")}
            onSaved={handleSaved}
            token={token}
          />
        )}
      </div>
    </AdminLayout>
  );
}