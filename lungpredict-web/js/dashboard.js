// js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
  renderDashboardStats();
  await checkBackendStatus();
});

/**
 * Loads prediction history from localStorage and computes dashboard statistics.
 */
function renderDashboardStats() {
  const history = getHistory(); // Retrieves stored predictions or initializes with samples
  
  // DOM Elements
  const totalEl = document.getElementById("stat-total-predictions");
  const highEl = document.getElementById("stat-high-risk");
  const lowEl = document.getElementById("stat-low-risk");
  
  if (!totalEl || !highEl || !lowEl) return;
  
  const totalCount = history.length;
  const highCount = history.filter(item => item.risk === "High").length;
  const lowCount = history.filter(item => item.risk === "Low").length;
  
  // Animate counts or set directly
  totalEl.textContent = totalCount;
  highEl.textContent = highCount;
  lowEl.textContent = lowCount;
}

/**
 * Pings the FastAPI health endpoint to check connection state.
 * Displays a nice indicator banner.
 */
async function checkBackendStatus() {
  const banner = document.getElementById("backend-status-banner");
  if (!banner) return;
  
  const health = await checkHealth();
  
  banner.style.display = "flex";
  
  if (health && health.status === "ok") {
    const isModelLoaded = health.model_loaded !== false;
    banner.className = "status-banner online";
    banner.innerHTML = `
      <div class="status-banner-content">
        <i data-lucide="check-circle-2" style="width: 1.1rem; height: 1.1rem; color: #16a34a;"></i>
        <span><strong>Backend Connected:</strong> FastAPI Service is online ${isModelLoaded ? 'with trained ML model loaded.' : 'but model is still training.'}</span>
      </div>
      <span style="font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">ONLINE</span>
    `;
  } else {
    banner.className = "status-banner offline";
    banner.innerHTML = `
      <div class="status-banner-content">
        <i data-lucide="alert-circle" style="width: 1.1rem; height: 1.1rem; color: #d97706;"></i>
        <span><strong>Local Fallback Mode:</strong> Cannot reach API server at <code>${API_BASE_URL}</code>. Local estimators will execute automatically.</span>
      </div>
      <span style="font-size: 0.75rem; opacity: 0.8; font-weight: 600; text-transform: uppercase;">LOCAL ESTIMATES</span>
    `;
  }
  
  // Re-run lucide on the banner elements since we modified innerHTML
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}
