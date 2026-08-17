// js/prediction.js

// Global Wizard Form State
let currentStep = 1;
const totalSteps = 5;

const formState = {
  fullName: "",
  gender: "Male",
  age: "",
  height: "",
  weight: "",
  chronicDisease: "No",
  allergy: "No",
  smoking: "No",
  alcoholConsuming: "No",
  peerPressure: "No",
  yellowFingers: "No",
  anxiety: "No",
  fatigue: "No",
  wheezing: "No",
  coughing: "No",
  shortnessOfBreath: "No",
  swallowingDifficulty: "No",
  chestPain: "No"
};

// Heuristic fallback calculation
function fallbackHeuristic(form) {
  const yes = (v) => (v === "Yes" ? 1 : 0);
  let score = 12
    + yes(form.smoking) * 22
    + yes(form.chestPain) * 14
    + yes(form.coughing) * 10
    + yes(form.shortnessOfBreath) * 10
    + yes(form.wheezing) * 8
    + yes(form.chronicDisease) * 10
    + yes(form.yellowFingers) * 8
    + yes(form.swallowingDifficulty) * 6
    + yes(form.fatigue) * 5
    + yes(form.allergy) * 3
    + yes(form.anxiety) * 3
    + yes(form.peerPressure) * 3
    + yes(form.alcoholConsuming) * 3;
  
  score = Math.min(97, score);
  const level = score >= 60 ? "High" : score >= 30 ? "Medium" : "Low";
  return { risk_level: level, probability: score };
}

document.addEventListener("DOMContentLoaded", () => {
  initToggleButtons();
  setupNavigationHandlers();
  syncFormInputsToState();
});

/**
 * Initializes the Yes/No toggle pill buttons.
 * Attaches click listeners and highlights "No" as the default selection.
 */
function initToggleButtons() {
  const toggleButtons = document.querySelectorAll(".btn-pill");
  
  // Highlight default values (which are pre-populated in formState)
  toggleButtons.forEach(button => {
    const field = button.getAttribute("data-field");
    const val = button.getAttribute("data-val");
    
    if (formState[field] === val) {
      if (val === "Yes") {
        button.classList.add("selected-yes");
      } else {
        button.classList.add("selected-no");
      }
    }
    
    // Click Listener
    button.addEventListener("click", (e) => {
      const parent = button.parentElement;
      const siblings = parent.querySelectorAll(".btn-pill");
      
      // Update formState
      formState[field] = val;
      
      // Clear all active selection styles
      siblings.forEach(sib => {
        sib.classList.remove("selected-yes", "selected-no");
      });
      
      // Apply active style to clicked button
      if (val === "Yes") {
        button.classList.add("selected-yes");
      } else {
        button.classList.add("selected-no");
      }
    });
  });
}

/**
 * Syncs the manual inputs (Full Name, Gender, Age, Height, Weight) on step 1 to the formState.
 */
function syncFormInputsToState() {
  const fields = ["fullName", "gender", "age", "height", "weight"];
  fields.forEach(fId => {
    const element = document.getElementById(fId);
    if (element) {
      element.addEventListener("input", () => {
        formState[fId] = element.value;
        // Clear errors as user corrects them
        const errorEl = document.getElementById(`error-${fId}`);
        if (errorEl) errorEl.textContent = "";
      });
    }
  });
}

/**
 * Validates the inputs for the active pane.
 * @returns {boolean} Whether the current step's inputs are valid.
 */
function validateActiveStep() {
  let isValid = true;
  
  if (currentStep === 1) {
    const nameInput = document.getElementById("fullName");
    const ageInput = document.getElementById("age");
    const heightInput = document.getElementById("height");
    const weightInput = document.getElementById("weight");
    
    // Full Name
    if (!nameInput.value.trim()) {
      document.getElementById("error-fullName").textContent = "Full name is required.";
      isValid = false;
    } else {
      document.getElementById("error-fullName").textContent = "";
    }
    
    // Age
    const ageVal = parseInt(ageInput.value, 10);
    if (!ageInput.value || isNaN(ageVal) || ageVal < 1 || ageVal > 120) {
      document.getElementById("error-age").textContent = "Please enter a valid age (1 - 120).";
      isValid = false;
    } else {
      document.getElementById("error-age").textContent = "";
    }

    // Height (Optional, but if entered must be valid)
    if (heightInput.value) {
      const heightVal = parseInt(heightInput.value, 10);
      if (isNaN(heightVal) || heightVal < 50 || heightVal > 250) {
        document.getElementById("error-height").textContent = "Please enter a valid height (50 - 250 cm).";
        isValid = false;
      } else {
        document.getElementById("error-height").textContent = "";
      }
    }

    // Weight (Optional, but if entered must be valid)
    if (weightInput.value) {
      const weightVal = parseInt(weightInput.value, 10);
      if (isNaN(weightVal) || weightVal < 20 || weightVal > 300) {
        document.getElementById("error-weight").textContent = "Please enter a valid weight (20 - 300 kg).";
        isValid = false;
      } else {
        document.getElementById("error-weight").textContent = "";
      }
    }
  }
  
  return isValid;
}

/**
 * Setup standard Next, Back navigation buttons click events.
 */
function setupNavigationHandlers() {
  const btnNext = document.getElementById("btn-next");
  const btnBack = document.getElementById("btn-back");
  
  if (!btnNext || !btnBack) return;
  
  btnNext.addEventListener("click", () => {
    // Validate current step before proceeding
    if (!validateActiveStep()) return;
    
    if (currentStep < totalSteps) {
      currentStep++;
      goToStep(currentStep);
    } else {
      // Step 5 is review, clicking next here is "Submit"
      submitPrediction();
    }
  });
  
  btnBack.addEventListener("click", () => {
    if (currentStep > 1) {
      currentStep--;
      goToStep(currentStep);
    }
  });
}

/**
 * Changes active visible pane and updates header step indicators.
 * @param {number} step Step number to navigate to (1-5).
 */
function goToStep(step) {
  currentStep = step;
  
  // Update wizard indicator lines & completed states
  const stepNodes = document.querySelectorAll(".step-node");
  stepNodes.forEach(node => {
    const nodeStep = parseInt(node.getAttribute("data-step"), 10);
    node.classList.remove("active", "completed");
    
    if (nodeStep === step) {
      node.classList.add("active");
    } else if (nodeStep < step) {
      node.classList.add("completed");
    }
  });
  
  // Calculate percentage width for connective progress line
  const progressLine = document.getElementById("step-progress-line");
  if (progressLine) {
    const pct = ((step - 1) / (totalSteps - 1)) * 100;
    progressLine.style.width = `${pct}%`;
  }
  
  // Switch visible panels
  const panes = document.querySelectorAll(".step-pane");
  panes.forEach(pane => {
    const paneNum = parseInt(pane.getAttribute("data-pane"), 10);
    if (paneNum === step) {
      pane.classList.add("active");
    } else {
      pane.classList.remove("active");
    }
  });
  
  // Update Buttons
  const btnBack = document.getElementById("btn-back");
  const btnNext = document.getElementById("btn-next");
  
  // Back disabled on Step 1
  btnBack.disabled = (step === 1);
  
  // Change text of Next button to "Submit" on Step 5
  if (step === totalSteps) {
    btnNext.innerHTML = `
      <span>Submit Prediction</span>
      <i data-lucide="check-circle-2" style="width: 1.1rem; height: 1.1rem;"></i>
    `;
    populateReviewSummary();
  } else {
    btnNext.innerHTML = `
      <span>Next</span>
      <i data-lucide="arrow-right" style="width: 1.1rem; height: 1.1rem;"></i>
    `;
  }
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Renders entered form state key/value summaries for Step 5 review screen.
 */
function populateReviewSummary() {
  const container = document.getElementById("review-summary-container");
  if (!container) return;
  
  const getBadgeClass = (val) => val === "Yes" ? "badge high" : "badge low";
  
  container.innerHTML = `
    <!-- Demographics -->
    <div class="review-section">
      <h4>Personal Information</h4>
    </div>
    <div class="review-row">
      <span class="review-label">Full Name</span>
      <span class="review-value">${formState.fullName}</span>
    </div>
    <div class="review-row">
      <span class="review-label">Gender / Age</span>
      <span class="review-value">${formState.gender}, ${formState.age} yrs</span>
    </div>
    <div class="review-row">
      <span class="review-label">Height / Weight</span>
      <span class="review-value">
        ${formState.height ? `${formState.height} cm` : "Not provided"} / 
        ${formState.weight ? `${formState.weight} kg` : "Not provided"}
      </span>
    </div>
    
    <!-- Medical History -->
    <div class="review-section" style="margin-top: 1rem;">
      <h4>Medical Background</h4>
    </div>
    <div class="review-row">
      <span class="review-label">Chronic Lung Disease</span>
      <span class="review-value"><span class="${getBadgeClass(formState.chronicDisease)}">${formState.chronicDisease}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Known Allergies</span>
      <span class="review-value"><span class="${getBadgeClass(formState.allergy)}">${formState.allergy}</span></span>
    </div>
    
    <!-- Lifestyle -->
    <div class="review-section" style="margin-top: 1rem;">
      <h4>Lifestyle & Environmental Factors</h4>
    </div>
    <div class="review-row">
      <span class="review-label">Current / Former Smoker</span>
      <span class="review-value"><span class="${getBadgeClass(formState.smoking)}">${formState.smoking}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Alcohol Consumption</span>
      <span class="review-value"><span class="${getBadgeClass(formState.alcoholConsuming)}">${formState.alcoholConsuming}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Social Peer Pressure</span>
      <span class="review-value"><span class="${getBadgeClass(formState.peerPressure)}">${formState.peerPressure}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Yellowing of Fingers</span>
      <span class="review-value"><span class="${getBadgeClass(formState.yellowFingers)}">${formState.yellowFingers}</span></span>
    </div>

    <!-- Symptoms -->
    <div class="review-section" style="margin-top: 1rem;">
      <h4>Reported Symptoms</h4>
    </div>
    <div class="review-row">
      <span class="review-label">Anxiety</span>
      <span class="review-value"><span class="${getBadgeClass(formState.anxiety)}">${formState.anxiety}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Chronic Fatigue</span>
      <span class="review-value"><span class="${getBadgeClass(formState.fatigue)}">${formState.fatigue}</span></span>
    </div>
    <div class="review-row">
      <span class="review-label">Wheezing / Chest Pain</span>
      <span class="review-value">
        Wheezing: <span class="${getBadgeClass(formState.wheezing)}">${formState.wheezing}</span> | 
        Chest Pain: <span class="${getBadgeClass(formState.chestPain)}">${formState.chestPain}</span>
      </span>
    </div>
    <div class="review-row">
      <span class="review-label">Coughing / Dyspnea</span>
      <span class="review-value">
        Coughing: <span class="${getBadgeClass(formState.coughing)}">${formState.coughing}</span> | 
        Shortness: <span class="${getBadgeClass(formState.shortnessOfBreath)}">${formState.shortnessOfBreath}</span>
      </span>
    </div>
    <div class="review-row">
      <span class="review-label">Dysphagia (Swallowing Difficulty)</span>
      <span class="review-value"><span class="${getBadgeClass(formState.swallowingDifficulty)}">${formState.swallowingDifficulty}</span></span>
    </div>
  `;
}

/**
 * Fires API prediction request, handles offline fallback fallback,
 * updates prediction history logs and displays results.
 */
async function submitPrediction() {
  const loading = document.getElementById("loading-overlay");
  loading.classList.add("active");
  
  // Format Payload according to FastAPI PatientInput model
  const payload = {
    fullName: formState.fullName || null,
    age: parseInt(formState.age, 10) || 0,
    gender: formState.gender,
    smoking: formState.smoking,
    yellowFingers: formState.yellowFingers,
    anxiety: formState.anxiety,
    peerPressure: formState.peerPressure,
    chronicDisease: formState.chronicDisease,
    fatigue: formState.fatigue,
    allergy: formState.allergy,
    wheezing: formState.wheezing,
    alcoholConsuming: formState.alcoholConsuming,
    coughing: formState.coughing,
    shortnessOfBreath: formState.shortnessOfBreath,
    swallowingDifficulty: formState.swallowingDifficulty,
    chestPain: formState.chestPain
  };
  
  let result = null;
  let errorMsg = null;
  
  // Short Artificial Delay to simulate medical processing (great for UX)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Attempt request to FastAPI backend
    result = await requestPrediction(payload);
  } catch (err) {
    console.warn("FastAPI predict call failed. Utilizing fallback local estimator.", err);
    errorMsg = err.message;
    // Compute local estimate as specified in instructions
    result = fallbackHeuristic(formState);
  }
  
  // Ensure we append to History logs
  const history = getHistory();
  const newId = generateNewId(history);
  const dateTime = formatCurrentDateTime();
  
  const historyRecord = {
    id: newId,
    name: formState.fullName || "Anonymous Patient",
    date: dateTime.date,
    time: dateTime.time,
    risk: result.risk_level,
    probability: Math.round(result.probability * 10) / 10 // ensure single rounded decimal
  };
  
  // Prepend to history store
  history.unshift(historyRecord);
  saveHistory(history);
  
  // Render Result View
  displayResult(result, errorMsg, historyRecord.id);
  
  // Hide loader
  loading.classList.remove("active");
}

/**
 * Renders the results screen.
 * @param {Object} res Output containing { risk_level, probability }
 * @param {string|null} errorMsg Error message if fallback was triggered, null otherwise.
 * @param {string} predictionId Newly generated record ID for referencing.
 */
function displayResult(res, errorMsg, predictionId) {
  const wizardHeader = document.getElementById("wizard-steps-header");
  const wizardForm = document.getElementById("wizard-form");
  const resultContainer = document.getElementById("result-view-container");
  
  if (!wizardHeader || !wizardForm || !resultContainer) return;
  
  // Hide wizard elements
  wizardHeader.style.display = "none";
  wizardForm.style.display = "none";
  
  const lowText = "Based on our model, the clinical symptoms and lifestyle profile represent low risk indicators. Continue maintaining active lifestyle profiles and schedule regular health cleanups.";
  const medText = "Medium risk factors observed. It is highly recommended to seek medical screening advice, track minor changes in fatigue or chest paint, and reduce environmental toxins/tobacco exposure.";
  const highText = "Urgent: High risk clinical symptoms, medical histories and risk profiles observed. Please schedule a physical clinical assessment with an oncologist or respiratory therapist as soon as possible.";
  
  const recommendation = res.risk_level === "High" ? highText : (res.risk_level === "Medium" ? medText : lowText);
  const riskClass = res.risk_level.toLowerCase();
  
  resultContainer.style.display = "block";
  resultContainer.innerHTML = `
    <div class="result-card">
      <div class="success-icon-wrapper">
        <i data-lucide="check-circle-2"></i>
      </div>
      <h2>Prediction Complete</h2>
      <p class="result-subtitle">Here is the estimated lung cancer risk profile generated for <strong>${formState.fullName || 'this patient'}</strong> (Reference ID: <code>${predictionId}</code>).</p>
      
      <!-- Risk Score Indicator Panel -->
      <div class="result-score-box">
        <span class="result-risk-badge ${riskClass}">${res.risk_level} Risk</span>
        <span class="result-percentage">${res.probability}%</span>
        <span class="result-percentage-label">Calculated Probability Factor</span>
      </div>
      
      <!-- Warning Box if Local Heuristic Fallback was used -->
      ${errorMsg ? `
        <div class="warning-box">
          <i data-lucide="alert-triangle" class="warning-icon"></i>
          <div>
            <div class="warning-box-title">Model Server Offline Fallback</div>
            <p>The backend model prediction API was unreachable (<em>${errorMsg}</em>). Displaying high-fidelity, local heuristic rule-based estimates.</p>
          </div>
        </div>
      ` : ''}
      
      <!-- Recommendations card -->
      <div style="background-color: var(--brand-50); border: 1px solid var(--brand-100); border-radius: 0.75rem; padding: 1.5rem; text-align: left; max-width: 600px; margin-bottom: 2.5rem;">
        <h4 style="font-weight: 700; color: var(--brand-700); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <i data-lucide="brain-circuit" style="width: 1.15rem; height: 1.15rem;"></i>
          <span>Clinical Recommendations</span>
        </h4>
        <p style="font-size: 0.9rem; line-height: 1.6; color: #334155;">${recommendation}</p>
      </div>

      <!-- Action Footer -->
      <div style="display: flex; gap: 1rem;">
        <button type="button" id="btn-restart-wizard" class="btn-primary">
          <i data-lucide="plus-circle" style="width:1.15rem; height:1.15rem;"></i>
          <span>Start a New Prediction</span>
        </button>
        <a href="history.html" class="btn-secondary">
          <i data-lucide="clock" style="width:1.15rem; height:1.15rem;"></i>
          <span>View Patient Logs</span>
        </a>
      </div>
    </div>
  `;
  
  // Attach Restart Listener
  const btnRestart = document.getElementById("btn-restart-wizard");
  if (btnRestart) {
    btnRestart.addEventListener("click", () => {
      resetWizardForm();
    });
  }
  
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

/**
 * Resets formState variables, clears input fields, and returns wizard layout to Step 1.
 */
function resetWizardForm() {
  // Clear state memory
  formState.fullName = "";
  formState.gender = "Male";
  formState.age = "";
  formState.height = "";
  formState.weight = "";
  
  // Reset clinical indicators back to "No"
  const toggleFields = [
    "chronicDisease", "allergy", "smoking", "alcoholConsuming", "peerPressure",
    "yellowFingers", "anxiety", "fatigue", "wheezing", "coughing",
    "shortnessOfBreath", "swallowingDifficulty", "chestPain"
  ];
  toggleFields.forEach(f => formState[f] = "No");
  
  // Reset Form inputs visually
  const frm = document.getElementById("wizard-form");
  if (frm) frm.reset();
  
  // Visual Reset error messages
  const errs = document.querySelectorAll(".input-error-msg");
  errs.forEach(e => e.textContent = "");
  
  // Reset Toggle buttons highlight
  initToggleButtons();
  
  // Hide Results View, Show Wizard Headers and forms
  const wizardHeader = document.getElementById("wizard-steps-header");
  const wizardForm = document.getElementById("wizard-form");
  const resultContainer = document.getElementById("result-view-container");
  
  if (wizardHeader && wizardForm && resultContainer) {
    wizardHeader.style.display = "flex";
    wizardForm.style.display = "block";
    resultContainer.style.display = "none";
  }
  
  // Go to step 1
  goToStep(1);
}
