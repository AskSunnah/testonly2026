import { API_BASE } from "../../config";

export async function searchFatwas({
  query,
  page = 1,
  limit = 5,
  lang = "en",
  signal,
}) {
  const params = new URLSearchParams();

  params.set("q", query);
  params.set("page", page);
  params.set("limit", limit);
  params.set("lang", lang);

  const res = await fetch(`${API_BASE}/api/search?${params.toString()}`, {
    signal,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Search failed.");
  }

  return data;
}

export async function getSearchSuggestions({
  query,
  lang = "en",
  limit = 6,
  signal,
}) {
  const params = new URLSearchParams();

  params.set("q", query);
  params.set("lang", lang);
  params.set("limit", limit);

  const res = await fetch(
    `${API_BASE}/api/search/suggestions?${params.toString()}`,
    { signal },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Suggestions failed.");
  }

  return data.suggestions || [];
}
