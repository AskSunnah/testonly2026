import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../Components/Admin/AdminLayout";
import ConfirmationModal from "../../Components/ConfirmationModal";
import {
  CheckCircle,
  Clock,
  Trash2,
  User,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  AlertCircle,
  Ban,
  X,
  Eye,
} from "lucide-react";
import {
  getAllQuestions,
  deleteQuestion,
  declineQuestion,
} from "../../api/questions";

const PAGE_SIZE = 10;

const getDateValue = (q) => {
  if (q.createdAt) return new Date(q.createdAt).getTime();
  if (q._id && /^[0-9a-fA-F]{24}$/.test(q._id)) {
    return parseInt(q._id.substring(0, 8), 16) * 1000;
  }
  return 0;
};

const getStatuses = (q) => {
  const hasNewStatus = q.englishStatus || q.arabicStatus;
  if (!hasNewStatus && q.status === "answered") {
    return { en: "answered", ar: "answered" };
  }
  return {
    en: q.englishStatus || "unanswered",
    ar: q.arabicStatus || "unanswered",
  };
};

// Fully done = both languages answered (declined does NOT count as done)
const isFullyAnswered = (q) => {
  const { en, ar } = getStatuses(q);
  return en === "answered" && ar === "answered";
};

// Pending = at least one language is still unanswered (not answered, not declined)
// const isPending = (q) => {
//   const { en, ar } = getStatuses(q);
//   return en === "unanswered" || ar === "unanswered";
// };

const isPending = (q) => {
  if (q.wasDeclined) return false;

  const { en, ar } = getStatuses(q);

  return en === "unanswered" || ar === "unanswered";
};

// // Has any declined language
// const hasDeclined = (q) => {
//   const { en, ar } = getStatuses(q);
//   return en === "declined" || ar === "declined";
// };

const hasDeclined = (q) => q.wasDeclined === true;

const normalizeQuestions = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.questions)) return data.questions;
  return [];
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, lang }) {
  const answered = status === "answered";
  const declined = status === "declined";

  const styles = answered
    ? "bg-green-50 border-green-300 text-green-700"
    : declined
      ? "bg-amber-50 border-amber-300 text-amber-700"
      : "bg-red-50 border-red-300 text-red-600";

  const label = answered ? "Done" : declined ? "Declined" : "Pending";

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-[3px] rounded-full border ${styles}`}
    >
      {answered ? (
        <CheckCircle size={11} />
      ) : declined ? (
        <Ban size={11} />
      ) : (
        <Clock size={11} />
      )}
      {lang === "en" ? "English" : "Arabic"} {label}
    </span>
  );
}

// ─── Answer Button ────────────────────────────────────────────────────────────
// "answered" = disabled green tick
// "unanswered" OR "declined" = active red "+ Add" button (same flow, no difference)

function AnswerButton({ status, lang, onClick }) {
  const answered = status === "answered";
  const label = lang === "en" ? "English" : "Arabic";

  if (answered) {
    return (
      <button
        disabled
        className="flex items-center gap-1 text-xs font-semibold px-3 py-[7px] rounded-lg border border-green-300 bg-green-50 text-green-700 cursor-default opacity-80"
      >
        <CheckCircle size={13} />
        {label} Added ✓
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs font-bold px-3 py-[7px] rounded-lg border-2 border-red-500 text-red-600 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-150"
    >
      + Add {label} Answer
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function QuestionCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 mb-3 shadow-sm animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-gray-100 rounded-full w-24" />
            <div className="h-5 bg-gray-100 rounded-full w-28" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-[90%] mb-2" />
          <div className="h-4 bg-gray-100 rounded w-[65%] mb-3" />
          <div className="flex flex-wrap gap-2">
            <div className="h-3 bg-gray-100 rounded w-24" />
            <div className="h-3 bg-gray-100 rounded w-36" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <div className="h-6 bg-gray-100 rounded-full w-28" />
          <div className="h-6 bg-gray-100 rounded-full w-28" />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
        <div className="h-8 bg-gray-100 rounded-lg w-36" />
        <div className="h-8 bg-gray-100 rounded-lg w-36" />
        <div className="h-8 bg-gray-100 rounded-lg w-20 ml-auto" />
      </div>
    </div>
  );
}

// ─── Email Preview ────────────────────────────────────────────────────────────

const DEFAULT_MSG_EN = `Thank you for submitting your question to AskSunnah. After careful consideration, our scholars are unfortunately unable to provide an answer to this question at this time.\n\nWe encourage you to seek guidance from a qualified local scholar or Islamic centre who may be better placed to address your specific circumstances.\n\nWe ask Allah to make things easy for you and guide you to what is correct.`;

const DEFAULT_MSG_AR = `شكرًا لتواصلكم مع اسأل السنة. بعد مراجعة سؤالكم بعناية، نأسف لإبلاغكم بأن علماءنا غير قادرين على الإجابة عنه في الوقت الحاضر.\n\nنشجعكم على التواصل مع عالم محلي متخصص أو مركز إسلامي قريب منكم، إذ قد يكونون أقدر على الإجابة عن حالتكم الخاصة.\n\nنسأل الله تعالى أن ييسر أموركم ويهديكم إلى ما فيه الخير.`;

function EmailPreview({ lang, name, question, message }) {
  const isAr = lang === "ar";
  const paragraphs = message
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const preview =
    question.length > 200 ? question.slice(0, 200) + "…" : question;

  return (
    <div
      style={{ background: "#f5f3ec", padding: "16px 12px", borderRadius: 10 }}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e2d0",
          borderRadius: 10,
          overflow: "hidden",
          maxWidth: 440,
          margin: "0 auto",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div
          style={{
            background: "#fffdf8",
            borderBottom: "1px solid #efe9d9",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {isAr ? (
            <>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#b08d17" }}
                >
                  اسأل السنة
                </div>
                <div style={{ fontSize: 10, color: "#999", lineHeight: 1.5 }}>
                  علم شرعي أصيل · مستند إلى القرآن والسنة
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "#f5edd6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#b08d17",
                  flexShrink: 0,
                }}
              >
                AS
              </div>
            </>
          ) : (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: "#f5edd6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#b08d17",
                  flexShrink: 0,
                }}
              >
                AS
              </div>
              <div>
                <div
                  style={{ fontSize: 15, fontWeight: 700, color: "#b08d17" }}
                >
                  AskSunnah
                </div>
                <div style={{ fontSize: 10, color: "#999", lineHeight: 1.5 }}>
                  Authentic Islamic Knowledge · Based on the Qur'an &amp; Sunnah
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "20px 22px" }}>
          <p
            style={{
              fontSize: 13,
              color: "#454545",
              marginBottom: 10,
              lineHeight: 1.85,
            }}
          >
            {isAr
              ? "السلام عليكم ورحمة الله وبركاته،"
              : "Assalamu alaykum wa rahmatullahi wa barakatuh,"}
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#454545",
              marginBottom: 14,
              lineHeight: 1.85,
            }}
          >
            {isAr ? "الأخ الكريم " : "Dear "}
            <strong style={{ color: "#222" }}>{name || "valued user"}</strong>
            {isAr ? "،" : ","}
          </p>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              style={{
                fontSize: 13,
                color: "#454545",
                marginBottom: 12,
                lineHeight: 1.85,
              }}
            >
              {para}
            </p>
          ))}
          <div style={{ margin: "18px 0 14px" }}>
            <div
              style={{
                fontSize: 10,
                color: "#9c8130",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              {isAr ? "السؤال المرسل" : "Your submitted question"}
            </div>
            <div
              style={{
                background: "#fcfaf5",
                border: "1px solid #ece2bf",
                borderRadius: 7,
                padding: "11px 13px",
                fontSize: 12,
                color: "#555",
                fontStyle: "italic",
                lineHeight: 1.75,
              }}
            >
              {preview}
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              color: "#454545",
              marginTop: 16,
              lineHeight: 1.85,
            }}
          >
            {isAr ? "جزاكم الله خيراً،" : "Jazakum Allahu Khayran,"}
            <br />
            <strong>{isAr ? "فريق اسأل السنة" : "Team AskSunnah"}</strong>
          </p>
        </div>

        <div
          style={{
            background: "#faf8f2",
            borderTop: "1px solid #efe8d8",
            padding: "12px 18px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 10, color: "#aaa", lineHeight: 1.7 }}>
            {isAr
              ? "منصة لنشر العلم الشرعي المستند إلى القرآن والسنة."
              : "A platform for Islamic knowledge based on the Qur'an and Sunnah."}
            <br />
            {isAr
              ? "تحت إشراف الدكتور الشيخ فلاح كركولي"
              : "Supervised by Dr. Sheikh Falah Kurkully"}
            <br />© AskSunnah {new Date().getFullYear()}.{" "}
            {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmailPreviewModal({ lang, name, question, message, onClose }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
        style={{ maxWidth: 820, maxHeight: "90vh" }}
        role="dialog"
        aria-modal="true"
        aria-label="Email preview"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p className="text-sm font-semibold text-gray-800">Email preview</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Exactly what will be sent to the user
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-4"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <EmailPreview
            lang={lang}
            name={name}
            question={question}
            message={message}
          />
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-semibold bg-[#c3a421] text-white px-5 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            Close preview
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cannot Answer Modal ──────────────────────────────────────────────────────
// ─── Cannot Answer Modal ──────────────────────────────────────────────────────

function CannotAnswerModal({
  question,
  lang,
  name,
  email,
  onClose,
  onDeclined,
}) {
  const isAr = lang === "ar";
  const defaultMsg = isAr ? DEFAULT_MSG_AR : DEFAULT_MSG_EN;

  const [message, setMessage] = useState(defaultMsg);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleSend = async () => {
    setSending(true);
    setApiError("");
    try {
      await declineQuestion(question._id, lang, message);
      setSent(true);
      setTimeout(() => {
        onDeclined(question._id, lang);
        onClose();
      }, 1600);
    } catch (err) {
      console.error(err);
      setApiError("Failed to send — please try again.");
      setSending(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !showPreview) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, showPreview]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
        onClick={(e) =>
          e.target === e.currentTarget && !showPreview && onClose()
        }
      >
        <div
          className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden w-full"
          style={{ maxWidth: 820, maxHeight: "90vh" }}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">
                Can't answer this question
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Notification sent to{" "}
                <span className="font-medium text-gray-600">
                  {email || "this user"}
                </span>{" "}
                in{" "}
                <span className="font-medium text-gray-600">
                  {isAr ? "Arabic" : "English"}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-4"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Their question
              </p>
              <div
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 italic leading-relaxed"
                dir={isAr ? "rtl" : "ltr"}
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {question.question}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Message to user
                </p>
                <button
                  type="button"
                  onClick={() => setMessage(defaultMsg)}
                  className="text-xs font-medium text-[#b08d17] hover:text-[#8f7210] underline underline-offset-2"
                >
                  Reset to default
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">
                The body of the email. Greeting and sign-off are added
                automatically.
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1200}
                dir={isAr ? "rtl" : "ltr"}
                rows={7}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none focus:outline-none focus:border-[#c3a421] focus:ring-2 focus:ring-[#c3a421]/10 leading-relaxed"
              />
              <p className="text-right text-xs text-gray-400 mt-1">
                {message.length} / 1200
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              <p className="font-semibold text-amber-900 mb-0.5">
                Before sending
              </p>
              <p className="text-amber-700">
                This marks this question as declined and sends a one-time email
                to
                <strong>{email}</strong>. Once declined, the question is closed
                and cannot receive answers.
              </p>
            </div>

            {apiError && (
              <p className="text-sm text-red-600 font-medium">{apiError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
            {sent ? (
              <span className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <CheckCircle size={15} />
                Sent — question marked as declined.
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={sending}
                  className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={13} />
                    Preview email
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || sent}
                    className="flex items-center gap-2 text-sm font-semibold bg-[#c3a421] text-white px-5 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {sending ? (
                      <>
                        <svg
                          className="animate-spin"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      "Send notification"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showPreview && (
        <EmailPreviewModal
          lang={lang}
          name={name}
          question={question.question}
          message={message}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}
// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({ q, lang, onDelete, onDeclined, navigate }) {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const { en: enStatus, ar: arStatus } = getStatuses(q);
  const fullyDone = enStatus === "answered" && arStatus === "answered";
  const wasDeclined = hasDeclined(q);

  const missing = [];
  if (enStatus !== "answered") missing.push("English");
  if (arStatus !== "answered") missing.push("Arabic");

  const handleAddAnswer = (answerLang) => {
    const params = new URLSearchParams({
      questionId: q._id,
      question: q.question || "",
      name: q.name || "",
      lang: answerLang,
    });
    navigate(`/add-qa?${params.toString()}`);
  };

  return (
    <>
      <div
        className={`rounded-xl border p-4 mb-3 transition-all duration-200 ${
          fullyDone
            ? "border-green-200 bg-white"
            : wasDeclined
              ? "border-amber-200 bg-amber-50/30"
              : "border-red-200 bg-red-50/40 shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-[3px] rounded-full border ${
                  fullyDone
                    ? "bg-green-50 border-green-200 text-green-700"
                    : wasDeclined
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {fullyDone ? (
                  <CheckCircle size={12} />
                ) : wasDeclined ? (
                  <Ban size={12} />
                ) : (
                  <AlertCircle size={12} />
                )}
                {fullyDone
                  ? "Completed"
                  : wasDeclined
                    ? "Declined"
                    : `Needs ${missing.join(" + ")}`}
              </span>

              <span
                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-[2px] rounded-full border ${
                  lang === "ar"
                    ? "border-purple-200 bg-purple-50 text-purple-600"
                    : "border-blue-200 bg-blue-50 text-blue-600"
                }`}
              >
                {lang === "ar" ? "Arabic Question" : "English Question"}
              </span>
            </div>

            <p className="text-sm font-semibold text-gray-800 m-0 leading-relaxed">
              {q.question}
            </p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <User size={12} /> {q.name || "Anonymous"}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1 break-all">
                <Mail size={12} /> {q.email || "No email provided"}
              </span>
              {q.createdAt && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(q.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1 items-end shrink-0">
            <StatusBadge
              status={wasDeclined ? "declined" : enStatus}
              lang="en"
            />

            <StatusBadge
              status={wasDeclined ? "declined" : arStatus}
              lang="ar"
            />
          </div>
        </div>

        {/* Declined info banner */}
        {wasDeclined && !fullyDone && (
          <div className="flex items-start gap-2 px-3 py-2 mb-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed">
            <Ban size={12} className="shrink-0 mt-0.5" />
            <span>
              User was notified that this question cannot be answered. This
              question has been closed and can no longer receive answers.
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
          {/* Both answer buttons always active unless that language is answered */}
          {/* Only allow answering if the question has not been declined */}
          {!wasDeclined && (
            <>
              <AnswerButton
                status={enStatus}
                lang="en"
                onClick={() => handleAddAnswer("en")}
              />

              <AnswerButton
                status={arStatus}
                lang="ar"
                onClick={() => handleAddAnswer("ar")}
              />
            </>
          )}

          {/* Can't answer — only show if not yet declined and not fully answered */}
          {/* {!fullyDone && !wasDeclined && ( */}
          {!fullyDone &&
            !wasDeclined &&
            enStatus === "unanswered" &&
            arStatus === "unanswered" && (
              <button
                onClick={() => setShowDeclineModal(true)}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-[7px] rounded-lg border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
              >
                <X size={12} /> Can't answer
              </button>
            )}

          <button
            onClick={() => onDelete(q._id, lang)}
            className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 px-2 py-[7px] rounded-lg hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {showDeclineModal && (
        <CannotAnswerModal
          question={q}
          lang={lang}
          name={q.name}
          email={q.email}
          onClose={() => setShowDeclineModal(false)}
          onDeclined={onDeclined}
        />
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserQuestions() {
  const navigate = useNavigate();

  const [enQuestions, setEnQuestions] = useState([]);
  const [arQuestions, setArQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [langFilter, setLangFilter] = useState("both");
  const [statusFilter, setStatusFilter] = useState("unanswered");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    lang: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchAllQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const [enData, arData] = await Promise.all([
        getAllQuestions("en"),
        getAllQuestions("ar"),
      ]);
      setEnQuestions(normalizeQuestions(enData));
      setArQuestions(normalizeQuestions(arData));
    } catch (err) {
      console.error("Failed to load user questions:", err);
      setError("Failed to load questions. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  // Pending count = questions where at least one language is still unanswered
  const enPending = enQuestions.filter((q) => isPending(q)).length;
  const arPending = arQuestions.filter((q) => isPending(q)).length;
  const bothPending = enPending + arPending;

  // Update local state after decline (status flip, card stays visible)
  // const handleDeclined = (id, lang) => {
  //   const apply = (prev) =>
  //     prev.map((x) =>
  //       x._id === id
  //         ? {
  //             ...x,
  //             englishStatus: lang === "en" ? "declined" : x.englishStatus,
  //             arabicStatus: lang === "ar" ? "declined" : x.arabicStatus,
  //             wasDeclined: true,
  //           }
  //         : x
  //     );
  //   if (lang === "ar") setArQuestions(apply);
  //   else setEnQuestions(apply);
  // };

  const handleDeclined = (id, lang) => {
    const apply = (prev) =>
      prev.map((x) =>
        x._id === id
          ? {
              ...x,
              wasDeclined: true,
            }
          : x,
      );

    if (lang === "ar") setArQuestions(apply);
    else setEnQuestions(apply);
  };

  const filteredList = useMemo(() => {
    let base = [];
    if (langFilter === "en") {
      base = enQuestions.map((q) => ({ ...q, _lang: "en" }));
    } else if (langFilter === "ar") {
      base = arQuestions.map((q) => ({ ...q, _lang: "ar" }));
    } else {
      base = [
        ...enQuestions.map((q) => ({ ...q, _lang: "en" })),
        ...arQuestions.map((q) => ({ ...q, _lang: "ar" })),
      ];
    }

    base = [...base].sort((a, b) => getDateValue(b) - getDateValue(a));

    if (statusFilter === "unanswered") {
      // Pending = at least one language still genuinely unanswered
      base = base.filter((q) => isPending(q));
    } else if (statusFilter === "declined") {
      // Declined = user was notified, but answers can still be added
      base = base.filter((q) => hasDeclined(q));
    } else if (statusFilter === "answered") {
      base = base.filter((q) => isFullyAnswered(q));
    }
    // "all" = no filter

    if (search.trim()) {
      const s = search.toLowerCase();
      base = base.filter(
        (q) =>
          q.question?.toLowerCase().includes(s) ||
          q.name?.toLowerCase().includes(s) ||
          q.email?.toLowerCase().includes(s),
      );
    }

    return base;
  }, [enQuestions, arQuestions, langFilter, statusFilter, search]);

  const totalPages = Math.ceil(filteredList.length / PAGE_SIZE);
  const paginated = filteredList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const resetPage = () => setPage(1);

  const handleDelete = async () => {
    if (!deleteModal.id || !deleteModal.lang) return;
    setDeleting(true);
    try {
      await deleteQuestion(deleteModal.id, deleteModal.lang);
      if (deleteModal.lang === "en") {
        setEnQuestions((prev) => prev.filter((q) => q._id !== deleteModal.id));
      } else {
        setArQuestions((prev) => prev.filter((q) => q._id !== deleteModal.id));
      }
    } catch (err) {
      console.error("Delete question error:", err);
      setError("Failed to delete question. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: null, lang: null });
    }
  };

  const tabBtn = (value, label, count) => (
    <button
      onClick={() => {
        setLangFilter(value);
        resetPage();
      }}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
        langFilter === value
          ? "bg-[#c3a421] text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
      }`}
    >
      {label}
      {count > 0 && (
        <span
          className={`text-[10px] font-bold px-[6px] py-[1px] rounded-full ${langFilter === value ? "bg-white/30 text-white" : "bg-red-500 text-white"}`}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <AdminLayout>
      <ConfirmationModal
        open={deleteModal.open}
        message="Delete this question? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, lang: null })}
        loading={deleting}
      />

      <div className="max-w-[860px] mx-auto mt-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 m-0">
            User Questions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Each submitted question needs both an English and Arabic answer.
          </p>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {tabBtn("both", "Both", bothPending)}
          {tabBtn("en", "English", enPending)}
          {tabBtn("ar", "العربية", arPending)}
        </div>

        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by question, name, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#c3a421]"
            />
          </div>

          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-semibold shrink-0">
            {["unanswered", "declined", "all", "answered"].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setStatusFilter(v);
                  resetPage();
                }}
                className={`px-4 py-2 transition-colors capitalize whitespace-nowrap ${
                  statusFilter === v
                    ? "bg-[#c3a421] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {v === "unanswered"
                  ? "Pending"
                  : v === "answered"
                    ? "Done"
                    : v === "declined"
                      ? "Declined"
                      : "All"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <QuestionCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500 text-sm">{error}</div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            {search
              ? "No questions match your search."
              : "No questions in this view."}
          </div>
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-3">
              {filteredList.length} question
              {filteredList.length !== 1 ? "s" : ""}
              {statusFilter === "unanswered" ? " needing attention" : ""}
              {statusFilter === "declined" ? " declined" : ""}
            </p>

            {paginated.map((q) => (
              <QuestionCard
                key={`${q._lang}-${q._id}`}
                q={q}
                lang={q._lang}
                navigate={navigate}
                onDelete={(id, lang) =>
                  setDeleteModal({ open: true, id, lang })
                }
                onDeclined={handleDeclined}
              />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
