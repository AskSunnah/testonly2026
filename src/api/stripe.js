// src/api/stripe.js
import { API_BASE } from "../../config";
export const createCheckoutSession = async (data) => {
  const res = await fetch(`${API_BASE}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const contentType = res.headers.get('content-type');

  // ✅ Ensure we got JSON back
  if (!res.ok || !contentType?.includes('application/json')) {
    const errorText = await res.text();
    console.error('❌ Error response from backend:', errorText);
    throw new Error('Failed to create checkout session. See console for details.');
  }

  return await res.json();
};

export const createPortalSession = async (customerId) => {
  const res = await fetch(`${API_BASE}/api/create-portal-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId }),
  });

  const contentType = res.headers.get('content-type');

  if (!res.ok || !contentType?.includes('application/json')) {
    const errorText = await res.text();
    console.error('❌ Error response from backend:', errorText);
    throw new Error('Failed to create portal session. See console for details.');
  }

  return await res.json();
};
