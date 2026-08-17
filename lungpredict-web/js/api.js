// js/api.js

/**
 * Sends a prediction request to the FastAPI backend.
 * @param {Object} payload Patient clinical details.
 * @returns {Promise<Object>} Object containing { risk_level, probability }
 */
async function requestPrediction(payload) {
  const res = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let detail = null;
    try { detail = await res.json(); } catch (_) {}
    throw new Error(detail?.detail || `Prediction request failed (${res.status})`);
  }
  return res.json(); // { risk_level: "Low"|"Medium"|"High", probability: number }
}

/**
 * Checks backend health status.
 * @returns {Promise<Object|null>} Object containing { status, model_loaded } or null
 */
async function checkHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend health check failed:", err);
  }
  return null;
}
