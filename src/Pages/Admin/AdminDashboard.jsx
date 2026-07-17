import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../Components/Admin/AdminLayout";
import {
  BookOpen,
  FileText,
  MessageSquare,
  CheckCircle,
  Library,
  PlusCircle,
  BookPlus,
} from "lucide-react";
import { API_BASE } from "../../../config";

const StatCardSkeleton = () => (
  // .stat-card-skeleton
  <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-[#f0f0f0] flex items-center gap-[18px]">
    <div className="w-[56px] h-[56px] rounded-[14px] bg-[#f3f4f6] animate-pulse shrink-0" />
    <div className="flex-1">
      <div className="h-[14px] w-[110px] bg-[#f3f4f6] rounded animate-pulse mb-2" />
      <div className="h-[28px] w-[60px] bg-[#f3f4f6] rounded animate-pulse mb-2" />
      <div className="h-[12px] w-[140px] bg-[#f3f4f6] rounded animate-pulse" />
    </div>
  </div>
);

const StatCard = ({
  title,
  value,
  breakdown,
  icon: Icon,
  color,
  onClick,
  urgent,
}) => {
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    // .stat-card
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)] border border-[#f0f0f0] flex items-center gap-[18px] relative transition-all duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] ${
        onClick
          ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2"
          : ""
      } ${urgent ? "border-l-4 border-l-[#ea580c]" : ""}`}
      style={onClick ? { "--tw-ring-color": color } : undefined}
    >
      {/* .stat-icon */}
      <div
        className="p-[14px] rounded-[14px] shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={28} color={color} strokeWidth={2.2} />
      </div>

      {/* .stat-info */}
      <div className="flex-1">
        {/* .stat-label */}
        <p className="text-[0.875rem] text-[#6b7280] m-0 mb-1 font-medium">
          {title}
        </p>
        {/* .stat-number */}
        <h3 className="text-[2.125rem] font-extrabold text-[#111827] m-0 leading-[1.1]">
          {value}
        </h3>
        {breakdown && (
          // .stat-detail
          <p className="text-[0.82rem] text-[#9ca3af] mt-[6px] mb-0 font-medium">
            {Object.entries(breakdown)
              .filter(([, v]) => v > 0)
              .map(([lang, v]) => `${v} ${lang}`)
              .join(" • ")}
          </p>
        )}
      </div>
    </div>
  );
};

const SectionLabel = ({ children }) => (
  // .section-label
  <div className="flex items-center gap-3 mb-4 mt-2">
    <h2 className="text-[0.78rem] font-bold uppercase tracking-[0.08em] text-[#9ca3af] m-0">
      {children}
    </h2>
    <div className="flex-1 h-px bg-[#e5e7eb]" />
  </div>
);

const QuickActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2.5 bg-white border border-[#e5e7eb] rounded-xl px-5 py-3 font-semibold text-[0.9rem] text-[#374151] transition-all hover:border-[#c3a421] hover:text-[#c3a421] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
  >
    <Icon size={18} />
    {label}
  </button>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: null,
    totalAnswers: null,
    pendingQuestions: null,
    totalFeedback: null,
    reportsPending: null,
    breakdown: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [now, setNow] = useState(new Date());

  const fetchStats = () => {
    setLoading(true);
    setLoadError(false);

    fetch(`${API_BASE}/api/admin/stats`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setStats({
          totalBooks: data.totalBooks || 0,
          totalAnswers: data.totalAnswers || 0,
          pendingQuestions: data.pendingQuestions || 0,
          totalFeedback: data.feedbackTotal || 0,
          reportsPending: data.reportsPending || 0,
          breakdown: {
            booksEn: data.booksEn || 0,
            booksAr: data.booksAr || 0,
            answersEn: data.answersEn || 0,
            answersAr: data.answersAr || 0,
            feedbackEn: data.feedbackEn || 0,
            feedbackAr: data.feedbackAr || 0,
            pendingQuestionsEn: data.pendingQuestionsEn || 0,
            pendingQuestionsAr: data.pendingQuestionsAr || 0,
          },
        });
      })
      .catch(() => {
        setLoadError(true);
        setStats({
          totalBooks: "—",
          totalAnswers: "—",
          pendingQuestions: "—",
          totalFeedback: "—",
          reportsPending: "—",
          breakdown: null,
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    const clockTimer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(clockTimer);
  }, []);

  const pendingCount = Number(stats.pendingQuestions) || 0;
  const pendingReportsCount = Number(stats.reportsPending) || 0;
  const totalUrgent = pendingCount + pendingReportsCount;

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <AdminLayout>
      <div className="max-w-[1180px] mx-auto">
        {/* .dashboard-header */}
        <div className="flex justify-between items-start flex-wrap gap-4 pb-6 mb-2 border-b border-[#e5e7eb]">
          <div>
            <h1 className="text-[1.85rem] font-bold text-[#111827] m-0">
              Welcome back, Admin
            </h1>
            <p className="text-[0.95rem] text-[#6b7280] mt-1 mb-0">
              {dateLabel} · {timeLabel}
            </p>
          </div>

          {!loading && !loadError && (
            <div
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-[0.88rem] ${
                totalUrgent > 0
                  ? "bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]"
                  : "bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]"
              }`}
            >
              {totalUrgent > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#ea580c] shrink-0" />
                  {totalUrgent} item{totalUrgent !== 1 ? "s" : ""} need
                  attention
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  All caught up
                </>
              )}
            </div>
          )}
        </div>

        {loadError && (
          // .stats-error-banner
          <div className="flex items-center justify-between gap-4 mt-4 px-5 py-3 bg-[#fef2f2] border border-[#fecaca] rounded-xl text-[#991b1b] text-[0.9rem]">
            <span>Couldn't load dashboard stats. Showing fallback values.</span>
            <button
              onClick={fetchStats}
              className="font-semibold underline shrink-0 hover:text-[#7f1d1d]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <SectionLabel>Quick Actions</SectionLabel>
        <div className="flex gap-3 flex-wrap mb-2">
          <QuickActionButton
            icon={PlusCircle}
            label="Add Q&A"
            onClick={() => navigate("/add-qa")}
          />
          <QuickActionButton
            icon={BookPlus}
            label="Add Book"
            onClick={() => navigate("/add-book")}
          />
          <QuickActionButton
            icon={FileText}
            label="Manage Questions Guide"
            onClick={() =>
              window.open(
                "https://drive.google.com/file/d/1h3hG0MoT6XXw--1wNXxDjQR0v86Ii-F5/view?usp=drive_link",
                "_blank",
              )
            }
          />
          <QuickActionButton
            icon={FileText}
            label="Manage Books Guide"
            onClick={() =>
              window.open(
                "https://drive.google.com/file/d/1Uz80PdUlsSoEIWHoAbbSB0U1JIG9LfrK/view?usp=drive_link",
                "_blank",
              )
            }
          />
        </div>

        {/* Needs Attention */}
        <SectionLabel>Needs Attention</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-2 max-[640px]:grid-cols-1">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Pending Questions"
                value={stats.pendingQuestions}
                breakdown={{
                  English: stats.breakdown?.pendingQuestionsEn,
                  Arabic: stats.breakdown?.pendingQuestionsAr,
                }}
                icon={pendingCount > 0 ? BookOpen : CheckCircle}
                color={pendingCount > 0 ? "#ea580c" : "#6b7280"}
                urgent={pendingCount > 0}
                onClick={() => navigate("/user-questions")}
              />
              <StatCard
                title="Pending Reports"
                value={stats.reportsPending}
                icon={pendingReportsCount > 0 ? FileText : CheckCircle}
                color={pendingReportsCount > 0 ? "#ea580c" : "#6b7280"}
                urgent={pendingReportsCount > 0}
                onClick={() => navigate("/reports")}
              />
            </>
          )}
        </div>

        {/* Content Overview */}
        <SectionLabel>Content Overview</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-5 mb-10 max-[640px]:grid-cols-1">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Books"
                value={stats.totalBooks}
                breakdown={{
                  English: stats.breakdown?.booksEn,
                  Arabic: stats.breakdown?.booksAr,
                }}
                icon={Library}
                color="#c3a421"
                onClick={() => navigate("/all-books")}
              />
              <StatCard
                title="Published Q&As"
                value={stats.totalAnswers}
                breakdown={{
                  English: stats.breakdown?.answersEn,
                  Arabic: stats.breakdown?.answersAr,
                }}
                icon={FileText}
                color="#16a34a"
                onClick={() => navigate("/all-qa")}
              />
              <StatCard
                title="Total Feedback"
                value={stats.totalFeedback}
                breakdown={{
                  English: stats.breakdown?.feedbackEn,
                  Arabic: stats.breakdown?.feedbackAr,
                }}
                icon={MessageSquare}
                color="#2563eb"
                onClick={() => navigate("/user-feedback")}
              />
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
