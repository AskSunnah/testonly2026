import React, { useState, useEffect } from "react";
import AdminLayout from "../../Components/Admin/AdminLayout";
import { getAllFeedback } from "../../api/feedback";
import {
  Globe,
  User,
  Mail,
  Phone,
  Calendar,
  Star,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState("en");
  const [copiedId, setCopiedId] = useState(null);

  const isArabic = language === "ar";

  const sectionTranslations = {
    "Q&A": "قسم الأسئلة والأجوبة",
    Books: "قسم الكتب",
    "Search / Library": "البحث / المكتبة",
    Other: "أخرى",
  };

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await getAllFeedback(language);
      setFeedbacks(res.feedbacks || []);
    } catch (err) {
      console.error("Failed to load feedback:", err);
      alert("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [language]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen py-8 px-4" dir={isArabic ? "rtl" : "ltr"}>
        <div className="max-w-[1100px] mx-auto">
          {/* Header */}
          <div className="mb-8 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-[1.85rem] font-bold text-slate-800 m-0">
                {isArabic ? "آراء المستخدمين" : "User Feedback"}
              </h1>
              <p className="text-[0.95rem] text-slate-500 mt-1 mb-0">
                {isArabic
                  ? "مراجعة تقييمات وآراء مستخدمي AskSunnah"
                  : "Review feedback and ratings from AskSunnah users"}
              </p>
            </div>
            <button
              className="bg-slate-800 text-white border-none px-5 py-3 rounded-xl font-semibold cursor-pointer flex items-center gap-2 transition-all hover:bg-slate-700"
              onClick={() => setLanguage((l) => (l === "en" ? "ar" : "en"))}
            >
              <Globe size={18} />
              {isArabic ? "English" : "العربية"}
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-[14px] p-7 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200"
                >
                  <div className="h-5 mb-3.5 rounded-md bg-slate-100 animate-pulse w-[35%]" />
                  <div className="h-5 mb-3.5 rounded-md bg-slate-100 animate-pulse w-full" />
                  <div className="h-5 mb-3.5 rounded-md bg-slate-100 animate-pulse w-[70%]" />
                  <div className="h-[60px] mt-4 rounded-md bg-slate-100 animate-pulse w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && feedbacks.length === 0 && (
            <div className="text-center py-20 px-8 text-slate-500">
              <div className="w-[90px] h-[90px] bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={44} color="#94a3b8" />
              </div>
              <h3 className="text-2xl mb-2">
                {isArabic ? "لا توجد آراء بعد" : "No feedback yet"}
              </h3>
              <p>
                {isArabic
                  ? "ستظهر الآراء هنا عندما يرسلها المستخدمون"
                  : "Feedback will appear here once submitted."}
              </p>
            </div>
          )}

          {/* Feedback List */}
          {!loading &&
            feedbacks.map((fb) => (
              <div
                key={fb._id}
                className="bg-white rounded-[14px] p-7 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-slate-200 transition-all duration-[250ms] hover:-translate-y-[3px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)]"
              >
                <div className="flex justify-between items-start mb-5 flex-wrap gap-4">
                  <div className="flex flex-col gap-2">
                    {/* Name */}
                    <div className="font-semibold text-slate-800 text-[1.05rem] flex items-center gap-1.5">
                      <User size={18} />
                      {fb.name || (isArabic ? "مجهول" : "Anonymous")}
                    </div>

                    {/* Email */}
                    <div className="text-[0.88rem] text-slate-500 flex items-center gap-1.5">
                      <Mail size={16} />
                      {fb.email || (isArabic ? "لا يوجد بريد" : "No email")}
                      {fb.email && (
                        <button
                          className="bg-transparent border-none cursor-pointer text-slate-500 p-1"
                          onClick={() => copyToClipboard(fb.email, fb._id)}
                        >
                          {copiedId === fb._id ? (
                            <Check size={16} color="#16a34a" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Phone */}
                    {fb.phone && (
                      <div className="text-[0.88rem] text-slate-500 flex items-center gap-1.5">
                        <Phone size={16} />
                        {fb.phone}
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-[0.88rem] text-slate-500 flex items-center gap-1.5">
                      <Calendar size={16} />
                      {new Date(fb.createdAt).toLocaleDateString(
                        isArabic ? "ar-EG" : "en-US",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </div>

                    {/* Rating */}
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-[1.5px] border-amber-400 px-3 py-1.5 rounded-full text-sm font-semibold w-fit">
                      <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                      Rating {fb.rating}/5
                    </div>

                    {/* Sections */}
                    {fb.section?.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[0.85rem] text-slate-500 font-semibold mb-2">
                          {isArabic
                            ? "الأقسام المختارة:"
                            : "Selected sections:"}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {fb.section.map((value, i) => (
                            <span
                              key={i}
                              className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-[0.8rem] font-medium"
                            >
                              {isArabic
                                ? sectionTranslations[value] || value
                                : value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Text */}
                <div className="bg-slate-50 border border-slate-200 border-l-4 border-l-[#c3a421] px-6 py-5 rounded-xl text-[1.02rem] leading-relaxed text-slate-700 mt-3 whitespace-pre-line">
                  {fb.feedback}
                </div>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  );
}
