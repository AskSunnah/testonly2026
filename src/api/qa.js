import { API_BASE } from "../../config";

// Submit a linked answer (from a user question)
export async function submitQA(data, lang = "en") {
  const endpoint =
    lang === "ar"
      ? `${API_BASE}/api/admin/submit_ar`
      : `${API_BASE}/api/admin/submit`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok)
    throw new Error(
      result.message || "Could not save this Q&A. Please try again.",
    );
  return result;
}

// Submit a standalone answer (no user question link)
export async function submitStandaloneQA(data) {
  const res = await fetch(`${API_BASE}/api/admin/submit_standalone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok)
    throw new Error(
      result.message || "Could not save this Q&A. Please try again.",
    );
  return result;
}

// Edit an existing Q&A
export async function editQA(data, slug, lang = "en") {
  const endpoint =
    lang === "ar"
      ? `${API_BASE}/api/admin/edit_ar/${slug}`
      : `${API_BASE}/api/admin/edit/${slug}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!res.ok)
    throw new Error(
      result.message || "Could not update this Q&A. Please try again.",
    );
  return result;
}

// Get Q&A by slug/lang (for edit form)
export async function getQA(slug, lang = "en") {
  const endpoint =
    lang === "ar" ? `/api/ar/questions/${slug}` : `/api/questions/${slug}`;
  const res = await fetch(`${API_BASE}` + endpoint);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Get all published Q&As (for AllQA page + RelatedModal)
export async function getAllQuestions(lang = "en") {
  const url = lang === "ar" ? `${API_BASE}/api/ar/all` : `${API_BASE}/api/all`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Delete a published Q&A
export async function deleteQuestion(lang, slug) {
  const url =
    lang === "ar"
      ? `${API_BASE}/api/admin/delete_ar/${slug}`
      : `${API_BASE}/api/admin/delete/${slug}`;
  const res = await fetch(url, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Failed to delete!");
  return true;
}