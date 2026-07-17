import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, deleteQuestion } from "../../api/qa";
import ConfirmationModal from "../../Components/ConfirmationModal";
import AdminLayout from "../../Components/Admin/AdminLayout";
import {
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  X,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function AllQA() {
  const [englishQuestions, setEnglishQuestions] = useState([]);
  const [arabicQuestions, setArabicQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("en");
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([getAllQuestions("en"), getAllQuestions("ar")])
      .then(([eng, ar]) => {
        if (isMounted) {
          setEnglishQuestions(eng.slice().reverse());
          setArabicQuestions(ar.slice().reverse());
        }
      })
      .catch(() => {
        if (isMounted) setMsg("Failed to load questions.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showConfirm = (message, action) => {
    setModalMessage(message);
    setModalAction(() => action);
    setModalOpen(true);
  };

  const handleDelete = (lang, slug) => {
    showConfirm(
      "Permanently delete this Q&A? This cannot be undone.",
      async () => {
        try {
          await deleteQuestion(lang, slug);
          setMsg("Deleted successfully.");
          if (lang === "en")
            setEnglishQuestions((prev) => prev.filter((q) => q.slug !== slug));
          else
            setArabicQuestions((prev) => prev.filter((q) => q.slug !== slug));
        } catch (e) {
          setMsg(e.message || "Delete failed.");
        }
      },
    );
  };

  const handleEdit = (lang, slug) => {
    navigate(`/add-qa?edit=1&lang=${lang}&slug=${slug}`);
  };

  const term = search.trim().toLowerCase();
  const filteredEnglish = useMemo(
    () =>
      term
        ? englishQuestions.filter((q) =>
            q.heading?.toLowerCase().includes(term),
          )
        : englishQuestions,
    [englishQuestions, term],
  );
  const filteredArabic = useMemo(
    () =>
      term
        ? arabicQuestions.filter((q) => q.heading?.toLowerCase().includes(term))
        : arabicQuestions,
    [arabicQuestions, term],
  );

  const filteredBoth = useMemo(
    () => [
      ...filteredEnglish.map((q) => ({ ...q, _lang: "en" })),
      ...filteredArabic.map((q) => ({ ...q, _lang: "ar" })),
    ],
    [filteredEnglish, filteredArabic],
  );

  const QACard = ({ q, index, lang, viewUrl, qLabel, showLangBadge }) => (
    <div
      key={q.slug}
      className="bg-white rounded-[14px] p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200 border-l-4 border-l-[#c3a421] flex justify-between items-center gap-4 flex-wrap transition-all duration-200 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
    >
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-[200px] text-slate-700 no-underline hover:underline flex items-start gap-2 group"
      >
        <span className="font-bold text-[#c3a421] shrink-0">
          {qLabel}
          {index + 1}:
        </span>
        <span className="text-[0.98rem]">{q.heading}</span>
        {showLangBadge && (
          <span
            className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              lang === "ar"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-sky-100 text-sky-700"
            }`}
          >
            {lang === "ar" ? "العربية" : "English"}
          </span>
        )}
        <ExternalLink
          size={14}
          className="text-slate-400 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </a>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border-none py-2 px-3.5 rounded-lg cursor-pointer font-medium text-[0.88rem] transition-all hover:bg-slate-200"
          onClick={() => handleEdit(lang, q.slug)}
        >
          <Pencil size={15} /> Edit
        </button>
        <button
          className="bg-red-50 text-red-600 border border-red-200 p-2.5 rounded-lg cursor-pointer transition-all hover:bg-red-100"
          onClick={() => handleDelete(lang, q.slug)}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );

  const QACardSkeleton = () => (
    <div className="bg-white rounded-[14px] p-5 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-slate-200 border-l-4 border-l-slate-200 flex justify-between items-center gap-4 flex-wrap animate-pulse">
      <div className="flex-1 min-w-[200px] flex items-start gap-2">
        <div className="h-5 w-8 bg-slate-100 rounded shrink-0" />
        <div className="flex-1">
          <div className="h-4 bg-slate-100 rounded w-[85%] mb-2" />
          <div className="h-4 bg-slate-100 rounded w-[55%]" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="h-9 w-20 bg-slate-100 rounded-lg" />
        <div className="h-9 w-10 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );

  const SectionBlock = ({ title, items, lang, qLabel, showLangBadge }) => {
    if (loading) {
      return (
        <section className="mb-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <QACardSkeleton key={i} />
          ))}
        </section>
      );
    }

    return (
      <section className="mb-10">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-slate-800 text-[1.15rem] font-bold m-0">
              {title}
            </h2>
            <span className="bg-slate-100 text-slate-500 text-[0.8rem] font-semibold px-2.5 py-1 rounded-full">
              {items.length}
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-12 px-6 text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-400" />
            <p className="m-0 font-medium">
              {term ? "No matching Q&As found." : "No questions found."}
            </p>
          </div>
        ) : (
          items.map((q, i) => (
            <QACard
              key={`${q._lang || lang}-${q.slug}`}
              q={q}
              index={i}
              lang={q._lang || lang}
              qLabel={q._lang === "ar" ? "س" : q._lang === "en" ? "Q" : qLabel}
              viewUrl={`${
                (q._lang || lang) === "ar"
                  ? "https://asksunnah.com/ar/questions/"
                  : "https://asksunnah.com/questions/"
              }${q.slug}`}
              showLangBadge={showLangBadge}
            />
          ))
        )}
      </section>
    );
  };

  return (
    <AdminLayout>
      <ConfirmationModal
        open={modalOpen}
        title="Confirmation"
        message={modalMessage}
        onConfirm={() => {
          modalAction && modalAction();
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      />

      <div className="max-w-[920px] mx-auto mt-10 px-4">
        <div className="mb-6">
          <h1 className="text-[1.85rem] font-bold text-slate-800 m-0 flex items-center gap-2.5">
            <FileText size={26} className="text-[#c3a421]" />
            All Q&amp;As
          </h1>
          <p className="text-[0.95rem] text-slate-500 mt-1 mb-0">
            Browse, edit, and manage published English and Arabic answers
          </p>
        </div>

        {msg && (
          <div
            className={`text-center mb-5 px-4 py-2.5 rounded-xl text-[0.9rem] font-medium ${
              msg.toLowerCase().includes("fail")
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {msg}
          </div>
        )}

        {/* Language Toggle */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1.5 mb-6 max-w-[480px]">
          <button
            onClick={() => setLangFilter("all")}
            className={`flex-1 px-4 py-2.5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer flex items-center justify-center gap-2 transition-all ${
              langFilter === "all"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Both
            <span className="bg-slate-300 text-slate-700 text-[0.72rem] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {englishQuestions.length + arabicQuestions.length}
            </span>
          </button>
          <button
            onClick={() => setLangFilter("en")}
            className={`flex-1 px-4 py-2.5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer flex items-center justify-center gap-2 transition-all ${
              langFilter === "en"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            English
            <span className="bg-slate-300 text-slate-700 text-[0.72rem] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {englishQuestions.length}
            </span>
          </button>
          <button
            onClick={() => setLangFilter("ar")}
            className={`flex-1 px-4 py-2.5 rounded-[10px] font-semibold text-[0.9rem] cursor-pointer flex items-center justify-center gap-2 transition-all ${
              langFilter === "ar"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            العربية
            <span className="bg-slate-300 text-slate-700 text-[0.72rem] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {arabicQuestions.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Q&As by title..."
            className="w-full pl-10 pr-9 py-3 border-[1.5px] border-slate-200 rounded-xl text-[0.95rem] outline-none focus:border-[#c3a421] transition-all bg-white shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {langFilter === "all" && (
          <SectionBlock items={filteredBoth} showLangBadge />
        )}
        {langFilter === "en" && (
          <SectionBlock items={filteredEnglish} lang="en" qLabel="Q" />
        )}
        {langFilter === "ar" && (
          <SectionBlock items={filteredArabic} lang="ar" qLabel="س" />
        )}
      </div>
    </AdminLayout>
  );
}
