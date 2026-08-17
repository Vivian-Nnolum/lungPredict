# LungPredict static web app

A clean, responsive, and dependency-free reconstruction of the **LungPredict** web application. Built entirely using pure semantic **HTML5**, **CSS3**, and **Vanilla ES6 JavaScript**, with absolutely no node_modules, framework overhead, bundlers, or build steps. 

This application integrates directly with a FastAPI backend to perform machine learning classification of lung health risks while maintaining high-fidelity, local rule-based heuristic fallback models to support completely offline operation.

---

## File Structure

```text
lungpredict-web/
├── index.html            # Dashboard (Default Landing Page)
├── about.html            # Informational panel on LungPredict
├── prediction.html       # 5-Step interactive clinical risk assessment wizard
├── history.html          # Searchable, paginated history logs
├── css/
│   └── styles.css        # Core custom responsive styles & design system
└── js/
    ├── config.js         # API endpoint settings & shared history store utilities
    ├── api.js            # fetch wrapper & health check endpoints
    ├── sidebar.js        # Dynamic HTML injector for persistent navigation bars
    ├── dashboard.js      # Live statistical counters & health check indicator
    ├── prediction.js     # Wizard form flow controls, validation & submissions
    └── history.js        # Search indexing, category filtering & record modals
```

---

## Brand & Design System

The application conforms to a premium, accessible medical design language:
*   **Font Family:** `Inter` (imported via Google Fonts).
*   **Background Base:** `#f7f8fa` (clean, dust-free grey).
*   **Typography:** `#1e293b` (highly-legible slate-800).
*   **Brand Highlight:** Deep emerald greens:
    *   `--brand-50` (`#eefaf3`)
    *   `--brand-100` (`#d7f2e2`)
    *   `--brand-500` (`#1f9d5c`)
    *   `--brand-600` (`#17824c`)
    *   `--brand-700` (`#136a3f`)
*   **Risk Level Status Badges:**
    *   **Low:** Background `#e5f7ea`, text `#1f9d5c`.
    *   **Medium:** Background `#fdf1d8`, text `#c9860f`.
    *   **High:** Background `#fce6e6`, text `#d9433f`.
*   **Cards & Layouts:** Rounded corners (`1rem` / `rounded-2xl`), generous white padding, and soft box shadows.

---

## Running the Web App

Because this is a completely static website, you do not need to install any packages with `npm` or `yarn`. 

### Method 1: Open Directly (Simple)
Simply navigate to your `lungpredict-web` directory and double-click `index.html`. It will open in your default browser using the `file://` protocol. All navigation links and localStorage features are fully functional.

### Method 2: Serve Locally (Recommended)
To test FastAPI integration or avoid local origin restrictions, we recommend serving the static files over HTTP. You can do this with any simple static server:

*   **VS Code Live Server:** Install the popular *Live Server* extension, open the `lungpredict-web` folder, and click **Go Live** in the bottom-right corner.
*   **Python:** If you have Python installed, open your terminal in the `lungpredict-web/` directory and run:
    ```bash
    python3 -m http.server 5500
    ```
    Then visit `http://localhost:5500` in your web browser.

---

## FastAPI Backend Integration & CORS

The application makes HTTP fetch requests to evaluate predictive risks. 

### 1. Configure the API Endpoint
The API endpoint is defined in a single file: `js/config.js`:
```javascript
const API_BASE_URL = "http://localhost:8000";
```
Change this variable to your live or remote production URL when deploying the backend.

### 2. Configure CORS in the FastAPI Backend
Since your static web app will run on an origin like `http://localhost:5500` (VS Code Live Server) or `http://127.0.0.1:5500` (Python's server), your FastAPI backend must allow requests from this origin.

Update your FastAPI's `CORSMiddleware` config to allow your hosting address:

```python
from fastapi.middleware.cors import CORSMiddleware

# Define active origins
origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:5173",  # legacy react dev server
    # Alternatively, use "*" during active local development:
    # "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Fallback Heuristic Rules

If the FastAPI service is offline or under development, the Prediction tool automatically captures the connection failure, notifies the user, and computes a local, high-fidelity score:

```javascript
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
```

Every prediction completes smoothly in either mode and writes new entries directly to your web browser's `localStorage` logs so that both the Dashboard counters and History lists stay synced.
