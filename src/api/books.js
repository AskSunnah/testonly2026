// src/api/books.js
import { API_BASE } from "../../config";

/**
 * Fetch a paginated, filtered, sorted list of books for a language.
 *
 *
 * @param {"en"|"ar"} lang
 * @param {number} page
 * @param {number} limit
 * @param {string} search       free-text search (title/author/description)
 * @param {string} category     "all" or a category value
 * @param {string} [author]     "all"/undefined or an exact author name
 * @param {string} [sort]       one of: order, title_asc, title_desc,
 *                              author_asc, author_desc, author_timeline_asc,author_timeline_desc, newest, oldest
 */
export async function fetchBooks(
  lang,
  page,
  limit,
  search,
  category,
  author,
  sort,
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) params.set("search", search);
  if (category && category !== "all") params.set("category", category);
  if (author && author !== "all") params.set("author", author);
  if (sort) params.set("sort", sort);

  const endpoint = lang === "ar" ? "ar" : "en";

  const res = await fetch(
    `${API_BASE}/api/books/${endpoint}?${params.toString()}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch books (${res.status})`);
  }

  return res.json();
}

/**
 * Fetch the distinct list of authors for a language, used to populate
 * the Author dropdown in the Advanced Search panel.
 *
 * @param {"en"|"ar"} lang
 * @returns {Promise<string[]>}
 */
export async function fetchAuthors(lang) {
  const endpoint = lang === "ar" ? "ar" : "en";

  const res = await fetch(`${API_BASE}/api/books/authors/${endpoint}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch authors (${res.status})`);
  }

  const data = await res.json();
  return data.authors || [];
}
