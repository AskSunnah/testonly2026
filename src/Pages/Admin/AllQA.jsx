import React, { useEffect, useState, useMemo ,useRef} from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, deleteQuestion, getQAPage } from "../../api/qa";
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
  const [page, setPage] = useState(1);

  const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);
const [counts, setCounts] = useState({ en: 0, ar: 0 });
const [loadingMore, setLoadingMore] = useState(false);
const [debouncedSearch, setDebouncedSearch] = useState("");
const reqId = useRef(0);

  const PAGE_SIZE = 20;

  // useEffect(() => {
  //   let isMounted = true;
  //   setLoading(true);

  //   Promise.all([getAllQuestions("en"), getAllQuestions("ar")])
  //     .then(([eng, ar]) => {
  //       if (isMounted) {
  //         setEnglishQuestions(eng.slice().reverse());
  //         setArabicQuestions(ar.slice().reverse());
  //       }
  //     })
  //     .catch(() => {
  //       if (isMounted) setMsg("Failed to load questions.");
  //     })
  //     .finally(() => {
  //       if (isMounted) setLoading(false);
  //     });

  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);


  // wait 350ms after typing stops before searching
useEffect(() => {
  const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
  return () => clearTimeout(t);
}, [search]);

const fetchItems = async (append) => {
  const id = ++reqId.current; // ignore out-of-date responses
  append ? setLoadingMore(true) : setLoading(true);
  try {
    const data = await getQAPage({
      lang: langFilter,
      skip: append ? items.length : 0,
      limit: PAGE_SIZE,
      search: debouncedSearch,
    });
    if (id !== reqId.current) return;
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setTotal(data.total);
    setCounts(data.counts);
  } catch {
    if (id === reqId.current) setMsg("Failed to load questions.");
  } finally {
    if (id === reqId.current) {
      setLoading(false);
      setLoadingMore(false);
    }
  }
};

// first page again whenever the tab or search changes
useEffect(() => {
  fetchItems(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [langFilter, debouncedSearch]);

//   useEffect(() => {
//   setPage(1);
// }, [search, langFilter]);

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
          setItems((prev) => prev.filter((q) => !(q.slug === slug && q._lang === lang)));
setTotal((t) => Math.max(0, t - 1));
setCounts((c) => ({ ...c, [lang]: Math.max(0, c[lang] - 1) }));
        } catch (e) {
          setMsg(e.message || "Delete failed.");
        }
      },
    );
  };

  const handleEdit = (lang, slug) => {
    navigate(`/add-qa?edit=1&lang=${lang}&slug=${slug}`);
  };


  // const activeItems =
  // langFilter === "all"
  //   ? filteredBoth
  //   : langFilter === "en"
  //     ? filteredEnglish
  //     : filteredArabic;

// const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
// const safePage = Math.min(page, totalPages);
// const offset = (safePage - 1) * PAGE_SIZE;
// const pageItems = activeItems.slice(offset, offset + PAGE_SIZE);

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
             {debouncedSearch ? "No matching Q&As found." : "No questions found."}
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
              {counts.en + counts.ar}
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
             {counts.en}
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
              {counts.ar}
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
<SectionBlock
  items={items}
  lang={langFilter === "all" ? undefined : langFilter}
  qLabel={langFilter === "ar" ? "س" : "Q"}
  showLangBadge={langFilter === "all"}
/>

{!loading && items.length > 0 && (
  <div className="flex flex-col items-center gap-3 mb-10">
    <p className="text-[0.8rem] text-slate-400 m-0">
      Showing {items.length} of {total}
    </p>
    {items.length < total && (
      <button
        onClick={() => fetchItems(true)}
        disabled={loadingMore}
        className="px-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
      >
        {loadingMore ? "Loading..." : "Load more"}
      </button>
    )}
  </div>
)}
      </div>
    </AdminLayout>
  );
}
