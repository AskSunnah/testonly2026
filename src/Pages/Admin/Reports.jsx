import React, { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "../../Components/Admin/AdminLayout";
import {
  fetchReports,
  updateReportStatus,
  deleteReport,
  fetchQuestionMeta,
  fetchBookMeta,
} from "../../api/adminReports";
import { Trash2, Loader2, X, BookOpen, MessageSquare, Flag, Globe } from "lucide-react";

const LIMIT = 20;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch { return iso; }
}

function splitReason(reason) {
  if (!reason) return [null, null];
  const idx = reason.indexOf(":");
  if (idx === -1) return [reason.trim(), null];
  return [reason.slice(0, idx).trim(), reason.slice(idx + 1).trim()];
}

function ReportedTextModal({ report, meta, onClose }) {
  const isRTL = report.lang === "ar";
  const [, reasonNote] = splitReason(report.reason);
  const isBook = report.contentType === "book_page";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4" onClick={onClose}>
      <div dir={isRTL ? "rtl" : "ltr"} className="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-7 py-6 border-b border-gray-100 shrink-0">
          <div>
            <p className="font-semibold text-[1rem] text-gray-900 m-0 leading-snug">{isBook ? (meta?.title || "Unknown book") : (meta?.heading || report.slug)}</p>
            {isBook && <p className="text-[0.82rem] text-gray-400 m-0 mt-1">{meta?.author && `${meta.author} · `}Page {report.pageNumber}</p>}
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-7 py-6 flex-1">
          {reasonNote && <p className="text-[0.82rem] text-gray-400 italic mb-5">User note: "{reasonNote}"</p>}
          <div dir={isRTL ? "rtl" : "ltr"} className={`bg-amber-50 ${isRTL ? "border-r-4 rounded-l-lg" : "border-l-4 rounded-r-lg"} border-amber-300 px-5 py-5 text-[0.96rem] text-gray-700 leading-relaxed whitespace-pre-wrap ${isRTL ? "text-right" : "text-left"}`}>
            {report.reportedText}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("pending");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [language, setLanguage] = useState("en"); // Simplified: only en/ar

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [modalReport, setModalReport] = useState(null);

  const [meta, setMeta] = useState({});
  const fetchedIds = useRef(new Set());

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchReports({ 
        page, 
        limit: LIMIT, 
        status: statusFilter, 
        contentType: contentTypeFilter, 
        lang: language 
      });
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, contentTypeFilter, language]);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { setPage(1); }, [statusFilter, contentTypeFilter, language]);

  // Meta fetching logic remains the same
  useEffect(() => {
    if (!reports.length) return;
    const fresh = reports.filter(r => !fetchedIds.current.has(r._id));
    if (!fresh.length) return;

    fresh.forEach(r => fetchedIds.current.add(r._id));
    setMeta(prev => {
      const next = { ...prev };
      fresh.forEach(r => { next[r._id] = { loading: true }; });
      return next;
    });

    fresh.forEach(async (report) => {
      try {
        let m = {};
        if (report.contentType === "question") {
          const d = await fetchQuestionMeta(report.slug, report.lang);
          m = { heading: d.heading, question: d.question };
        } else {
          const d = await fetchBookMeta(report.bookId, report.lang);
          m = { title: d.title, author: d.author };
        }
        setMeta(prev => ({ ...prev, [report._id]: m }));
      } catch {
        setMeta(prev => ({ ...prev, [report._id]: { error: true } }));
      }
    });
  }, [reports]);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const data = await updateReportStatus(id, newStatus);
      setReports(prev => prev.map(r => r._id === id ? data.report : r));
    } catch (err) {
      alert(err.message || "Failed to update.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r._id !== id));
      setTotal(t => Math.max(0, t - 1));
      if (modalReport?._id === id) setModalReport(null);
    } catch (err) {
      alert(err.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-[1060px] mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-[1.85rem] font-bold text-gray-900 m-0 mb-1">Reports</h1>
            <p className="text-[0.95rem] text-gray-500 m-0">{total} reports</p>
          </div>

          {/* Language Toggle - Clean like User Questions */}
          <button
            onClick={() => setLanguage(l => l === "en" ? "ar" : "en")}
            className="bg-slate-800 text-white border-none px-5 py-3 rounded-2xl font-semibold cursor-pointer flex items-center gap-2.5 hover:bg-slate-700 transition-all"
          >
            <Globe size={18} />
            {language === "en" ? "العربية" : "English"}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white px-6 py-6 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
            {[{ value: "all", label: "All" },{ value: "pending", label: "Pending" }, { value: "resolved", label: "Resolved" }].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-5 py-2.5 rounded-xl text-[0.9rem] font-medium transition-all border-none cursor-pointer ${statusFilter === value ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-2xl p-1">
            {[{ value: "all", label: "All types" }, { value: "question", label: "Fatwas" }, { value: "book_page", label: "Books" }].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setContentTypeFilter(value)}
                className={`px-5 py-2.5 rounded-xl text-[0.9rem] font-medium transition-all border-none cursor-pointer ${contentTypeFilter === value ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500 hover:text-gray-700"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : error ? (
          <div className="text-red-500 py-12 text-center text-sm">{error}</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-24">
            <Flag size={48} className="text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No reports found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map(report => (
              <ReportCard
                key={report._id}
                report={report}
                meta={meta[report._id]}
                updatingId={updatingId}
                deletingId={deletingId}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onOpenModal={setModalReport}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition"
            >
              Previous
            </button>
            <span className="text-sm text-gray-400 px-4">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-6 py-3 rounded-2xl border border-gray-200 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 cursor-pointer transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {modalReport && <ReportedTextModal report={modalReport} meta={meta[modalReport._id]} onClose={() => setModalReport(null)} />}
    </AdminLayout>
  );
}

function ReportCard({ report, meta, updatingId, deletingId, onStatusChange, onDelete, onOpenModal }) {
  const isRTL = report.lang === "ar";
  const isBook = report.contentType === "book_page";
  const isPending = report.status === "pending";
  const [reasonCategory, reasonNote] = splitReason(report.reason);

  const sourceName = meta?.loading || meta?.error ? null : isBook ? meta?.title : meta?.heading;

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="bg-white rounded-3xl border border-gray-100 shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] transition-all overflow-hidden">
      {isPending && <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-300" />}

      <div className="px-8 py-8 flex gap-6 items-start">
        <div className={`shrink-0 mt-1 w-12 h-12 rounded-2xl flex items-center justify-center ${isBook ? "bg-blue-50" : "bg-amber-50"}`}>
          {isBook ? <BookOpen size={20} className="text-blue-600" /> : <MessageSquare size={20} className="text-amber-600" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="min-w-0 flex-1">
              {meta?.loading ? (
                <div className="h-5 w-80 bg-gray-100 rounded animate-pulse mb-2" />
              ) : (
                <p className={`font-semibold text-[1.02rem] text-gray-800 leading-tight ${isRTL ? "text-right" : "text-left"}`} dir={isRTL ? "rtl" : "ltr"}>
                  {sourceName || (isBook ? "Unknown book" : report.slug)}
                  {isBook && report.pageNumber && <span className="font-medium text-gray-500 ml-2">• p.{report.pageNumber}</span>}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2 text-[0.8rem] text-gray-500">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isBook ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                  {isBook ? "Book" : "Fatwa"}
                </span>
                <span>{formatDate(report.createdAt)}</span>
                {reasonCategory && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-medium">{reasonCategory}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isPending ? (
                <button
                  onClick={() => onStatusChange(report._id, "resolved")}
                  disabled={updatingId === report._id}
                  className="text-sm px-6 py-2.5 rounded-2xl bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {updatingId === report._id ? "..." : "Mark Resolved"}
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange(report._id, "pending")}
                  disabled={updatingId === report._id}
                  className="text-sm px-6 py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition disabled:opacity-50"
                >
                  {updatingId === report._id ? "..." : "Reopen"}
                </button>
              )}

              <button
                onClick={(e) => onDelete(e, report._id)}
                disabled={deletingId === report._id}
                className="text-gray-400 hover:text-red-500 p-3 hover:bg-red-50 rounded-2xl transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-500">
              <span>Reported Text</span>
              <span className="text-gray-400 text-[0.7rem]">Click to expand</span>
            </div>

              <div>
                {report.email && (
                  <p className="text-[0.8rem] text-gray-400 italic mb-2">Reported by: {report.email}</p>
                )}
              </div>
            <div
              dir={isRTL ? "rtl" : "ltr"}
              onClick={() => onOpenModal(report)}
              className={`bg-amber-50 border-l-4 border-amber-300 rounded-2xl px-6 py-6 text-[0.97rem] leading-relaxed text-gray-700 cursor-pointer hover:bg-amber-100 transition-all line-clamp-5 ${isRTL ? "text-right" : "text-left"}`}
            >
              {report.reportedText}
            </div>

            {reasonNote && (
              <p className="text-[0.8rem] text-gray-400 italic">"{reasonNote}"</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}