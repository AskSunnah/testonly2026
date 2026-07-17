// api call for admin authentication
import { API_BASE } from "../../config";
export async function adminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return data;
  } catch {
    return { success: false, message: "Network error" };
  }
}
export function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiryTime = payload.exp * 1000;

    return Date.now() < expiryTime;
  } catch {
    return false;
  }
}
// src/api/adminAuth.js
export function logoutUser() {
  localStorage.removeItem("adminToken");
}
