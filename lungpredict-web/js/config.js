// js/config.js
const API_BASE_URL = "https://lungpredict.onrender.com"; // change to deployed backend URL when live

// Shared constants
const STORAGE_KEY = "lungpredict_history";

const SAMPLE_HISTORY = [
  { "id": "#LPD-00012", "name": "Aka Chukwu", "date": "23 May 2025", "time": "10:30 AM", "risk": "Low", "probability": 18 },
  { "id": "#LPD-00011", "name": "Victor ", "date": "15 May 2025", "time": "02:15 PM", "risk": "High", "probability": 76 },
  { "id": "#LPD-00010", "name": "Chi Som", "date": "05 May 2025", "time": "09:45 AM", "risk": "Medium", "probability": 45 },
  { "id": "#LPD-00009", "name": "Tochi Michael", "date": "28 Apr 2025", "time": "11:20 AM", "risk": "Low", "probability": 22 },
  { "id": "#LPD-00008", "name": "Vivian Chisom", "date": "18 Apr 2025", "time": "04:50 PM", "risk": "Low", "probability": 15 }
];

// Helper functions for history storage
function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
    return SAMPLE_HISTORY;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Error parsing history data", e);
    return SAMPLE_HISTORY;
  }
}

function saveHistory(historyArray) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historyArray));
}

function formatCurrentDateTime() {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  
  return { date: dateStr, time: timeStr };
}

function generateNewId(history) {
  let maxIdNum = 12; // fallback minimum
  history.forEach(item => {
    const matches = item.id.match(/\d+/);
    if (matches) {
      const num = parseInt(matches[0], 10);
      if (num > maxIdNum) maxIdNum = num;
    }
  });
  const nextNum = maxIdNum + 1;
  return `#LPD-${String(nextNum).padStart(5, '0')}`;
}
