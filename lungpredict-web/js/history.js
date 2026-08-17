// js/history.js

// Pagination and Filtering State
let historyData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 5;

document.addEventListener("DOMContentLoaded", () => {
  // Load initial history
  historyData = getHistory();
  
  // Set filters from URL Query parameters if present (e.g. ?risk=High from dashboard)
  checkURLQueryParameters();
  
  // Setup filter listeners
  setupFilterListeners();
  
  // Setup modal close listeners
  setupModalCloseListeners();
  
  // Run initial filter and render
  applyFiltersAndRender();
});

/**
 * Checks URL queries to pre-populate risk category selectors.
 */
function checkURLQueryParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const riskParam = urlParams.get("risk");
  
  if (riskParam) {
    const filterSelect = document.getElementById("filter-risk");
    if (filterSelect) {
      // Validate option matches (Low, Medium, High)
      if (["Low", "Medium", "High"].includes(riskParam)) {
        filterSelect.value = riskParam;
      }
    }
  }
}

/**
 * Setup event listeners for typing into search and changing risk select filters.
 */
function setupFilterListeners() {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-risk");
  
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1; // reset page to 1
      applyFiltersAndRender();
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      currentPage = 1; // reset page to 1
      applyFiltersAndRender();
    });
  }
}

/**
 * Applies search and category filters and renders the sliced table page.
 */
function applyFiltersAndRender() {
  const searchInput = document.getElementById("search-input");
  const filterSelect = document.getElementById("filter-risk");
  
  const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const riskVal = filterSelect ? filterSelect.value : "All";
  
  // 1. Filter Data
  filteredData = historyData.filter(item => {
    // Match Name or ID
    const matchSearch = item.name.toLowerCase().includes(searchVal) || item.id.toLowerCase().includes(searchVal);
    // Match Risk
    const matchRisk = (riskVal === "All") || (item.risk === riskVal);
    
    return matchSearch && matchRisk;
  });
  
  // 2. Render Table Rows
  renderTableRows();
  
  // 3. Render Pagination
  renderPagination();
}

/**
 * Renders the rows of the patient log history table.
 */
function renderTableRows() {
  const tableBody = document.getElementById("history-table-body");
  const emptyState = document.getElementById("empty-state");
  
  if (!tableBody) return;
  
  tableBody.innerHTML = "";
  
  if (filteredData.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    return;
  }
  
  if (emptyState) emptyState.style.display = "none";
  
  // Slice data for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredData.slice(startIndex, endIndex);
  
  // Populate
  paginatedItems.forEach(item => {
    const tr = document.createElement("tr");
    
    const riskClass = item.risk.toLowerCase();
    
    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--text-base);"><code>${item.id}</code></td>
      <td style="font-weight: 600;">${item.name}</td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <span>${item.date}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${item.time}</span>
        </div>
      </td>
      <td>
        <span class="badge ${riskClass}">${item.risk}</span>
      </td>
      <td>
        <span class="probability-text">${item.probability}%</span>
      </td>
      <td style="text-align: center;">
        <button type="button" class="action-btn view-record-btn" data-id="${item.id}" title="View Details">
          <i data-lucide="eye"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(tr);
  });
  
  // Bind click handlers to newly drawn eye action buttons
  const viewBtns = tableBody.querySelectorAll(".view-record-btn");
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const recId = btn.getAttribute("data-id");
      openRecordDetailModal(recId);
    });
  });
  
  // Initialize Lucide for the eye icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Handles generating and rendering page-number navigation.
 */
function renderPagination() {
  const controls = document.getElementById("pagination-controls");
  const infoText = document.getElementById("pagination-info-text");
  const pagesList = document.getElementById("pagination-pages-list");
  const prevBtn = document.getElementById("btn-page-prev");
  const nextBtn = document.getElementById("btn-page-next");
  
  if (!controls || filteredData.length === 0) {
    if (controls) controls.style.display = "none";
    return;
  }
  
  controls.style.display = "flex";
  
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Calculate bounds
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  // Info text
  if (infoText) {
    infoText.textContent = `Showing ${startItem} - ${endItem} of ${totalItems} entries`;
  }
  
  // Disable Nav arrows appropriately
  if (prevBtn) {
    prevBtn.disabled = (currentPage === 1);
    // Remove old listeners by cloning or direct reassignment (reassignment is fine since it's button click)
    prevBtn.onclick = () => {
      if (currentPage > 1) {
        currentPage--;
        applyFiltersAndRender();
      }
    };
  }
  
  if (nextBtn) {
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = () => {
      if (currentPage < totalPages) {
        currentPage++;
        applyFiltersAndRender();
      }
    };
  }
  
  // Numbers List
  if (pagesList) {
    pagesList.innerHTML = "";
    
    for (let i = 1; i <= totalPages; i++) {
      const pageBtn = document.createElement("button");
      pageBtn.className = `btn-page ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener("click", () => {
        currentPage = i;
        applyFiltersAndRender();
      });
      pagesList.appendChild(pageBtn);
    }
  }
}

/**
 * Populates detail layouts and opens the record viewer modal.
 * @param {string} id Patient prediction reference ID.
 */
function openRecordDetailModal(id) {
  const item = historyData.find(x => x.id === id);
  if (!item) return;
  
  const modal = document.getElementById("detail-modal");
  const modalTitle = document.getElementById("modal-id-title");
  const modalBody = document.getElementById("modal-detail-body");
  
  if (!modal || !modalTitle || !modalBody) return;
  
  modalTitle.innerHTML = `Record Details: <code>${item.id}</code>`;
  
  const riskClass = item.risk.toLowerCase();
  
  // Recommendation template
  let recommendText = "";
  if (item.risk === "High") {
    recommendText = "Urgent consultation advised. Seek formal diagnostic screenings including low-dose CT chest scans. Inform clinician of all coughing, wheezing and fatigue markers.";
  } else if (item.risk === "Medium") {
    recommendText = "Proactive clinical follow-up suggested. Monitor persistent lifestyle factors and schedule diagnostic review. Keep record of allergy or environmental toxins logs.";
  } else {
    recommendText = "Maintain regular health logs. Routine screening and symptom surveys should be re-run periodically or immediately upon development of persistent respiratory indicators.";
  }
  
  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      <!-- Patient / Date Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Patient Name</span>
          <span style="font-size: 1rem; font-weight: 700; color: var(--text-base);">${item.name}</span>
        </div>
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Diagnostic Date</span>
          <span style="font-size: 1rem; font-weight: 600; color: var(--text-base);">${item.date} at ${item.time}</span>
        </div>
      </div>
      
      <!-- Risk Score Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem 1.25rem;">
        <div>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Risk Classification</span>
          <span class="badge ${riskClass}" style="font-size: 0.85rem; padding: 0.35rem 1rem;">${item.risk} Risk</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Probability Factor</span>
          <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-base);">${item.probability}%</span>
        </div>
      </div>

      <!-- Detail Context Text -->
      <div>
        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.5rem;">Diagnostic Context</span>
        <p style="font-size: 0.9rem; line-height: 1.6; color: #334155; margin-bottom: 1rem;">
          This screening was completed using LungPredict's risk predictive algorithms. The calculated probability index evaluates the combination of their demographics, clinical indicators, and background hazards to categorize overall risk bounds.
        </p>
        
        <div style="background-color: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 0.5rem; padding: 1rem;">
          <span style="font-size: 0.75rem; color: var(--brand-700); font-weight: 700; text-transform: uppercase; display: block; margin-bottom: 0.25rem; letter-spacing: 0.05em;">Clinical Directive</span>
          <p style="font-size: 0.85rem; line-height: 1.5; color: #1e293b; font-weight: 500;">${recommendText}</p>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add("active");
}

/**
 * Binds close buttons triggers.
 */
function setupModalCloseListeners() {
  const modal = document.getElementById("detail-modal");
  const closeIconBtn = document.getElementById("modal-close-btn");
  const closeActionBtn = document.getElementById("modal-close-action-btn");
  
  if (!modal) return;
  
  const closeModal = () => {
    modal.classList.remove("active");
  };
  
  if (closeIconBtn) closeIconBtn.addEventListener("click", closeModal);
  if (closeActionBtn) closeActionBtn.addEventListener("click", closeModal);
  
  // Close on outer container backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
