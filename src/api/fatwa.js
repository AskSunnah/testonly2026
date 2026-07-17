//api calls for fatawa management
import { API_BASE } from "../../config";
export const fetchAllFatwas = async () => {
  const response = await fetch(`${API_BASE}/api/all`);
  if (!response.ok) {
    throw new Error('Failed to fetch fatwas');
  }
  const data = await response.json();
  return data;
};

export const fetchAllFatwasArabic = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/ar/all`);
    if (!response.ok) throw new Error('Failed to fetch Arabic fatwas');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[fetchAllFatwasArabic]', error);
    return [];
  }
};


export const fetchFatwaBySlug = async (slug, lang = 'en') => {
  const langPrefix = lang === 'ar' ? '/ar' : '';
  const url = `${API_BASE}/api${langPrefix}/questions/${slug}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fatwa not found');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching fatwa [${lang}]:`, error);
    return null;
  }
};
