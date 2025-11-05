// !!!!!! IMPORTANT: REPLACE 'YOUR_IP_ADDRESS_HERE' WITH YOUR IP !!!!!!
const API_URL_BASE = "http://192.168.56.1:5000/api/v1";

// This runs when the popup window is opened
document.addEventListener("DOMContentLoaded", () => {
  // --- Listeners ---
  // 1. For the "Report Page" button
  document.getElementById("report-button").addEventListener("click", reportPage);
  
  // 2. NEW: For the "Scan Link" button
  document.getElementById("scan-button").addEventListener("click", analyzePastedUrl);

  // --- Initial Action ---
  // 3. Analyze the currently active web page
  analyzeCurrentPage();
});

// =================================================================
// SECTION 1: MANUAL URL SCAN
// =================================================================
function analyzePastedUrl() {
  const urlInput = document.getElementById("url-input");
  const urlToScan = urlInput.value;
  
  // Find the result banner elements
  const banner = document.getElementById("scan-result-banner");
  const title = document.getElementById("scan-result-title");
  const reason = document.getElementById("scan-result-reason");

  if (!urlToScan) {
    displayScanResult(banner, title, reason, "GRAY", "Please paste a URL to scan.");
    return;
  }
  
  // Show a temporary "Scanning..." message
  displayScanResult(banner, title, reason, "GRAY", "Scanning...");

  // Send the URL to our NEW backend endpoint
  fetch(`${API_URL_BASE}/analyze-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: urlToScan }),
  })
    .then((response) => response.json())
    .then((data) => {
      displayScanResult(banner, title, reason, data.risk_level, data.reason_text);
    })
    .catch((error) => {
      console.error("Error:", error);
      displayScanResult(banner, title, reason, "GRAY", "Error: Could not connect to server.");
    });
}

/**
 * A helper function to display results in the MANUAL scan banner
 */
function displayScanResult(banner, title, reason, riskLevel, reasonText) {
  // Clear old color classes
  banner.className = "banner"; 

  switch (riskLevel) {
    case "GREEN":
      banner.classList.add("banner-green");
      title.innerText = "Safe";
      break;
    case "YELLOW":
      banner.classList.add("banner-yellow");
      title.innerText = "Caution";
      break;
    case "RED":
      banner.classList.add("banner-red");
      title.innerText = "High Risk";
      break;
    default: // GRAY for errors/info
      banner.classList.add("banner-gray");
      title.innerText = "Info";
      break;
  }
  reason.innerText = reasonText;
  banner.style.display = "block";
}


// =================================================================
// SECTION 2: CURRENT PAGE ANALYSIS
// =================================================================

/**
 * Gets text from the active web page and sends to backend
 */
function analyzeCurrentPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => document.body.innerText,
      },
      (injectionResults) => {
        if (chrome.runtime.lastError) {
          document.getElementById("loading").style.display = "none";
          displayPageResult("GRAY", "Error: Cannot analyze this page.");
          return;
        }
        const pageText = injectionResults[0].result;
        sendPageTextToApi(pageText);
      }
    );
  });
}

/**
 * Sends the captured page text to our backend.
 */
function sendPageTextToApi(text) {
  fetch(`${API_URL_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_text: text }),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("loading").style.display = "none";
      displayPageResult(data.risk_level, data.reason_text);
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("loading").style.display = "none";
      displayPageResult("GRAY", "Error: Could not connect to server.");
    });
}

/**
 * A helper function to display results in the PAGE analysis banner
 */
function displayPageResult(riskLevel, reasonText) {
  const banner = document.getElementById("banner");
  const title = document.getElementById("banner-title");
  const reason = document.getElementById("banner-reason");
  banner.className = "banner"; // Reset classes

  switch (riskLevel) {
    case "GREEN":
      banner.classList.add("banner-green");
      title.innerText = "Safe";
      break;
    case "YELLOW":
      banner.classList.add("banner-yellow");
      title.innerText = "Caution";
      break;
    case "RED":
      banner.classList.add("banner-red");
      title.innerText = "Danger";
      break;
    default:
      banner.classList.add("banner-gray");
      title.innerText = "Error";
      break;
  }
  reason.innerText = reasonText;
  banner.style.display = "block";
}

// =================================================================
// SECTION 3: REPORTING
// =================================================================

/**
 * Called when the "Report Page" button is clicked.
 */
function reportPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url; // Report the URL
    fetch(`${API_URL_BASE}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_id: currentUrl }),
    })
      .then(() => alert("Thank you! This page has been reported."))
      .catch(() => alert("Error: Could not submit report."));
  });
}