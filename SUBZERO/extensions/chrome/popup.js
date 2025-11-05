// SUBZERO Security Scanner - Popup Script

document.addEventListener('DOMContentLoaded', function() {
  // Tab navigation
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
          content.classList.add('active');
        }
      });
    });
  });
  
  // Load settings
  loadSettings();
  
  // Scan current page button
  const scanPageButton = document.getElementById('scan-page-button');
  scanPageButton.addEventListener('click', scanCurrentPage);
  
  // Scan URL button
  const scanUrlButton = document.getElementById('scan-url-button');
  scanUrlButton.addEventListener('click', () => {
    const urlInput = document.getElementById('url-input');
    const url = urlInput.value.trim();
    
    if (url) {
      scanUrl(url);
    }
  });
  
  // Save settings button
  const saveSettingsButton = document.getElementById('save-settings-button');
  saveSettingsButton.addEventListener('click', saveSettings);
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get([
    'apiKey',
    'apiEndpoint',
    'autoScan',
    'notifyThreats',
    'scanImages',
    'scanVideos',
    'scanAudio'
  ], function(data) {
    // Set input values
    document.getElementById('api-key-input').value = data.apiKey || '';
    document.getElementById('api-endpoint-input').value = data.apiEndpoint || 'http://localhost:8000/api';
    
    // Set toggle states
    document.getElementById('auto-scan').checked = data.autoScan !== false;
    document.getElementById('notify-threats').checked = data.notifyThreats !== false;
    document.getElementById('scan-images').checked = data.scanImages !== false;
    document.getElementById('scan-videos').checked = data.scanVideos !== false;
    document.getElementById('scan-audio').checked = data.scanAudio === true;
  });
}

// Save settings to storage
function saveSettings() {
  const settings = {
    apiKey: document.getElementById('api-key-input').value.trim(),
    apiEndpoint: document.getElementById('api-endpoint-input').value.trim(),
    autoScan: document.getElementById('auto-scan').checked,
    notifyThreats: document.getElementById('notify-threats').checked,
    scanImages: document.getElementById('scan-images').checked,
    scanVideos: document.getElementById('scan-videos').checked,
    scanAudio: document.getElementById('scan-audio').checked
  };
  
  chrome.storage.sync.set(settings, function() {
    // Show success message
    const saveButton = document.getElementById('save-settings-button');
    const originalText = saveButton.textContent;
    
    saveButton.textContent = 'Saved!';
    saveButton.style.backgroundColor = '#10b981';
    
    setTimeout(() => {
      saveButton.textContent = originalText;
      saveButton.style.backgroundColor = '';
    }, 1500);
  });
}

// Scan the current page
function scanCurrentPage() {
  // Get active tab
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const activeTab = tabs[0];
    
    // Show loading state
    setLoading(true);
    
    // Send message to background script
    chrome.runtime.sendMessage(
      { action: 'scanUrl', url: activeTab.url },
      function(response) {
        // Hide loading state
        setLoading(false);
        
        if (response && !response.error) {
          // Show result
          showScanResult(response);
        } else {
          // Show error
          showScanError(response ? response.error : 'Failed to scan page');
        }
      }
    );
  });
}

// Scan a specific URL
function scanUrl(url) {
  // Show loading state
  setLoading(true);
  
  // Send message to background script
  chrome.runtime.sendMessage(
    { action: 'scanUrl', url: url },
    function(response) {
      // Hide loading state
      setLoading(false);
      
      if (response && !response.error) {
        // Show result
        showScanResult(response);
      } else {
        // Show error
        showScanError(response ? response.error : 'Failed to scan URL');
      }
    }
  );
}

// Show scan result
function showScanResult(result) {
  const resultElement = document.getElementById('scan-result');
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultDetails = document.getElementById('result-details');
  
  // Set result class
  resultElement.className = 'scan-result';
  resultElement.classList.add(result.verdict.toLowerCase());
  
  // Set icon
  resultIcon.src = getVerdictIcon(result.verdict);
  
  // Set title
  resultTitle.textContent = result.verdict.toUpperCase();
  
  // Set details
  let details = `Confidence: ${(result.confidence * 100).toFixed(1)}%`;
  if (result.explanation) {
    details += `\n${result.explanation}`;
  }
  resultDetails.textContent = details;
  
  // Show result
  resultElement.style.display = 'block';
}

// Show scan error
function showScanError(error) {
  const resultElement = document.getElementById('scan-result');
  const resultIcon = document.getElementById('result-icon');
  const resultTitle = document.getElementById('result-title');
  const resultDetails = document.getElementById('result-details');
  
  // Set result class
  resultElement.className = 'scan-result';
  
  // Set icon
  resultIcon.src = 'icons/icon48.svg';
  
  // Set title
  resultTitle.textContent = 'Error';
  
  // Set details
  resultDetails.textContent = error || 'An unknown error occurred';
  
  // Show result
  resultElement.style.display = 'block';
}

// Get icon based on verdict
function getVerdictIcon(verdict) {
  switch (verdict.toLowerCase()) {
    case 'safe':
      return 'icons/safe.png';
    case 'suspicious':
      return 'icons/suspicious.png';
    case 'malicious':
      return 'icons/malicious.png';
    default:
    return 'icons/icon48.svg';
  }
}

// Set loading state
function setLoading(isLoading) {
  const loadingElement = document.getElementById('loading');
  const scanButton = document.getElementById('scan-page-button');
  const scanUrlButton = document.getElementById('scan-url-button');
  
  if (isLoading) {
    loadingElement.style.display = 'block';
    scanButton.disabled = true;
    scanUrlButton.disabled = true;
  } else {
    loadingElement.style.display = 'none';
    scanButton.disabled = false;
    scanUrlButton.disabled = false;
  }
}