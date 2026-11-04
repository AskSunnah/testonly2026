import { API_BASE } from "../../config";

const authHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// Submit a question
export const submitQuestion = async ({ name, email, question, language = 'en' }) => {
    try {
        const response = await fetch(`${API_BASE}/api/user-questions/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, question, language }),
        });


        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to submit question');
        return data;


    } catch (err) {
        console.error('API submitQuestion error:', err);
        throw err;
    }
};

// Get all questions

export const getAllQuestions = async (language = "en") => {
  const response = await fetch(
    `${API_BASE}/api/user-questions/admin?language=${language}`,
    {
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch questions");
  }

  return data;
};

// Update question status (no auth)
export const updateQuestionStatus = async (id, status, language = 'en') => {
    const response = await fetch(`${API_BASE}/api/user-questions/admin/${id}`, {
        method: 'PUT',
        headers: {
  "Content-Type": "application/json",
  ...authHeaders(),
},
        body: JSON.stringify({ status, language }),
    });
    return response.json();
};

export const deleteQuestion = async (id, language = "en") => {
  const response = await fetch(
    `${API_BASE}/api/user-questions/admin/${id}?language=${language}`,
    {
      method: "DELETE",
      headers: authHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete question");
  }

  return data;
};


export const declineQuestion = async (id, language = 'en', message = '') => {
  const response = await fetch(`${API_BASE}/api/user-questions/admin/${id}/decline`, {
    method: 'POST',
    headers: {
  "Content-Type": "application/json",
  ...authHeaders(),
},
    body: JSON.stringify({ language, message }), // ← was `reason`, backend expects `message`
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to decline question');
  return data;
};