// api calls for admin book management
import { API_BASE } from "../../config";

export async function submitBook(bookData) {
  const res = await fetch(`${API_BASE}/api/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error saving book.");
  }
  return data;
}

export async function fetchBooksAdmin(
  lang = "en",
  page = 1,
  limit = 20,
  search = "",
) {
  const params = new URLSearchParams();

  params.set("page", page);
  params.set("limit", limit);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const endpoint =
    lang === "ar"
      ? `${API_BASE}/api/books/ar?${params.toString()}`
      : `${API_BASE}/api/books/en?${params.toString()}`;

  const res = await fetch(endpoint);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch books");
  }

  return data;
}

export async function deleteBookAdmin(lang, slug) {
  const endpoint = `${API_BASE}/api/books/${lang}/${slug}`;

  const res = await fetch(endpoint, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete book");
  }
  return true;
}

export async function fetchBookAdmin(lang, slug) {
  const endpoint = `${API_BASE}/api/books/${lang}/${slug}`;

  const res = await fetch(endpoint);
  const data = await res.json();

  if (!res.ok || !data.book) {
    throw new Error(data.message || "Book not found");
  }

  return data.book;
}

export async function saveBookAdmin(lang, slug, bookData) {
  const endpoint = `${API_BASE}/api/books/${lang}/${slug}`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to save");
  }
  return true;
}

// REORDER BOOKS ADMIN
export async function reorderBooksAdmin(lang, bookId, newOrder) {
  const endpoint = `${API_BASE}/api/books/admin/reorder`;

  const res = await fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      language: lang,
      bookId,
      newOrder: Number(newOrder),
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to reorder book");
  }

  return data.books;
}

// --- Authors ---

export async function fetchAuthors(lang = "en") {
  const res = await fetch(`${API_BASE}/api/authors?language=${lang}`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch authors");
  }

  return data.authors;
}

export async function createAuthor(authorData) {
  const res = await fetch(`${API_BASE}/api/authors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authorData),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to save author");
  }

  return data.author;
}

export async function updateAuthor(authorId, authorData) {
  const res = await fetch(`${API_BASE}/api/authors/${authorId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(authorData),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update author");
  }

  return data.author;
}

// Returns the books currently linked to this author (title, slug, language)
export async function fetchAuthorBooks(authorId) {
  const res = await fetch(`${API_BASE}/api/authors/${authorId}/books`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch linked books");
  }

  return data.books;
}

// Moves a single book to a different saved author (or unlinks if newAuthorId is falsy).
// Used outside the deletion flow, e.g. "this book's author was tagged wrong."
export async function reassignBookAuthor(lang, slug, newAuthorId) {
  const res = await fetch(`${API_BASE}/api/books/${lang}/${slug}/author`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      authorId: newAuthorId || null,
      lang, // ← this is what the controller now reads
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to reassign book");
  }
  return data.book;
}

// Deletes an author. If the author has linked books, EVERY linked book's
// slug must appear in `reassignments` with a target newAuthorId, or the
// server rejects the whole request. The backend performs the reassignment(s)
// and the delete inside a single transaction — either all of it succeeds or
// none of it does.
//
// reassignments: [{ slug: string, newAuthorId: string }]
export async function deleteAuthor(authorId, reassignments = []) {
  const res = await fetch(`${API_BASE}/api/authors/${authorId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reassignments }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete author");
  }

  return data;
}
