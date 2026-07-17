import { API_BASE } from "../../config";

const authHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const fetchReports = async ({
  page = 1,
  limit = 20,
  status = "all",
  contentType = "all",
  lang = "all",
} = {}) => {
  const params = new URLSearchParams({
    page,
    limit,
    status,
    contentType,
    lang,
  });

  const res = await fetch(`${API_BASE}/api/reports?${params.toString()}`, {
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch reports.");
  }

  return data;
};

export const updateReportStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/api/reports/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to update report.");
  }

  return data;
};

export const deleteReport = async (id) => {
  const res = await fetch(`${API_BASE}/api/reports/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete report.");
  }

  return data;
};


export const fetchQuestionMeta = async (slug, lang) => {
  const path = lang === "ar" ? `/api/ar/questions/${slug}` : `/api/questions/${slug}`;
  const res = await fetch(`${API_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load question.");
  const data = await res.json();
  return { heading: data.heading, question: data.question };
};

export const fetchBookMeta = async (bookId, lang) => {
  const res = await fetch(
    `${API_BASE}/api/books/admin/meta/${bookId}?lang=${lang}`,
    { headers: authHeaders() }
  );
  if (!res.ok) throw new Error("Failed to load book.");
  return res.json(); // now just { title, author }
};