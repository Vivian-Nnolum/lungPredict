// js/sidebar.js

document.addEventListener("DOMContentLoaded", () => {
  injectSidebar();
  injectTopbar();
  
  // Initialize Lucide icons after injecting HTML
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.error("Lucide icon library not loaded!");
  }
});

function injectSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  // Determine current active page
  const path = window.location.pathname;
  let currentPage = path.split("/").pop() || "index.html";
  
  // If the path is just "/" or empty, default to index.html
  if (currentPage === "" || currentPage === "/") {
    currentPage = "index.html";
  }

  // Check which link should be active
  const isActive = (page) => {
    return currentPage === page || (page === "index.html" && currentPage === "") ? "active" : "";
  };

  container.className = "sidebar";
  container.innerHTML = `
    <div class="sidebar-brand">
      <div class="logo-square">
        <i data-lucide="wind" class="logo-icon"></i>
      </div>
      <div class="brand-info">
        <h1 class="brand-name">LungPredict</h1>
        <p class="brand-tagline">Early Detection. Better Tomorrow.</p>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <a href="index.html" class="nav-item ${isActive('index.html')}">
        <i data-lucide="layout-grid" class="nav-icon"></i>
        <span>Dashboard</span>
      </a>
      <a href="about.html" class="nav-item ${isActive('about.html')}">
        <i data-lucide="info" class="nav-icon"></i>
        <span>About</span>
      </a>
      <a href="prediction.html" class="nav-item ${isActive('prediction.html')}">
        <i data-lucide="plus-circle" class="nav-icon"></i>
        <span>Prediction</span>
      </a>
      <a href="history.html" class="nav-item ${isActive('history.html')}">
        <i data-lucide="clock" class="nav-icon"></i>
        <span>History</span>
      </a>
    </nav>
    
    <div class="sidebar-footer">
      <button id="logout-btn" class="logout-btn">
        <i data-lucide="log-out" class="nav-icon"></i>
        <span>Reset History</span>
      </button>
    </div>
  `;

  // Attach logout handler (used to reset history back to sample data in this static app context)
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const confirmReset = confirm("Would you like to reset your LungPredict history to the default sample dataset?");
      if (confirmReset) {
        localStorage.removeItem("lungpredict_history");
        alert("History successfully reset. Reloading page...");
        window.location.reload();
      }
    });
  }
}

function injectTopbar() {
  const container = document.getElementById("topbar-container");
  if (!container) return;

  container.className = "topbar";
  container.innerHTML = `
    <!-- Left side of topbar (optional search or section title) -->
    <div class="topbar-left" id="topbar-title-container">
      <span class="topbar-date" id="topbar-date-display"></span>
    </div>
    
    <!-- Right side (notifications + user avatar) -->
    <div class="topbar-right">
      <div class="notification-badge-container" title="Notifications">
        <button class="icon-btn">
          <i data-lucide="bell" class="topbar-icon"></i>
          <span class="red-dot"></span>
        </button>
      </div>
      
      <div class="user-profile">
        <div class="avatar-container">
          <i data-lucide="user-round" class="avatar-icon"></i>
        </div>
        <div class="user-details">
          <span class="user-name">Vivian</span>
          <span class="user-role">User</span>
        </div>
        <i data-lucide="chevron-down" class="chevron-icon"></i>
      </div>
    </div>
  `;

  // Set current date in topbar
  const dateDisplay = document.getElementById("topbar-date-display");
  if (dateDisplay) {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    dateDisplay.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
}
