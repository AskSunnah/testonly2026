import { API_BASE } from "../../config";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
});

export async function getQACategories(
  lang = "en",
  includeInactive = false,
  tree = false,
) {
  const url =
    `${API_BASE}/api/admin/qa-categories` +
    `?lang=${lang}&includeInactive=${includeInactive}&tree=${tree}`;

  const res = await fetch(url, {
    headers: authHeaders(),
  });
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not load categories.");
  }

  return data.categories;
}

export async function createQACategory(payload) {
  const res = await fetch(`${API_BASE}/api/admin/qa-categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      name: payload.name,
      lang: payload.lang,
      parent: payload.parent || null,
      description: payload.description || "",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not create category.");
  }

  return data.category;
}

export async function updateQACategory(id, payload) {
  const res = await fetch(`${API_BASE}/api/admin/qa-categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({
      name: payload.name,
      parent: payload.parent || null,
      description: payload.description || "",
      isActive: payload.isActive,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not update category.");
  }

  return data.category;
}

export async function toggleQACategory(id) {
  const res = await fetch(`${API_BASE}/api/admin/qa-categories/${id}/toggle`, {
    method: "PATCH",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not update category.");
  }

  return data.category;
}
export async function getQuestionsForCategory(categoryId) {
  const res = await fetch(
    `${API_BASE}/api/admin/qa-categories/${categoryId}/questions`,
    {
      headers: authHeaders(),
    }
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not load questions.");
  }

  return data;
}

export async function updateQuestionsForCategory(categoryId, questionIds) {
  const res = await fetch(
    `${API_BASE}/api/admin/qa-categories/${categoryId}/questions`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ questionIds }),
    },
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not update category questions.");
  }

  return data;
}
export async function deleteQACategory(id) {
  const res = await fetch(`${API_BASE}/api/admin/qa-categories/${id}/delete`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Could not delete category.");
  }

  return data;
}
