import { API_BASE } from "../../config";

// user facing api to submit the report
export const submitReport = async ({
  contentType,
  lang,
  slug,
  bookId,
  chapterNumber,
  pageNumber,
  reportedText,
  reason,
  email
}) => {
  const res = await fetch(`${API_BASE}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType,
      lang,
      slug,
      bookId,
      chapterNumber,
      pageNumber,
      reportedText,
      reason,
      email
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to submit report.");
  }

  return data;
};