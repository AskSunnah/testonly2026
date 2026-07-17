// api call for individual book
import { API_BASE } from "../../config";
export async function fetchBook(lang, slug) {
  const url = `${API_BASE}/api/books/${lang}/${slug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Book not found');
  const data = await res.json();
  return data.book;
}
