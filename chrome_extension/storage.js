// Chrome storage management

const STORAGE_KEYS = {
  SETTINGS: "settings",
  LOGS: "logs"
};

const DEFAULT_SETTINGS = {
  kidIds: [],
  authHeaders: {
    authorization: "",
    cookie: ""
  },
  isParentMode: false
};

// Get settings from storage
async function getSettings() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.SETTINGS]);
  return result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
}

// Save settings to storage
async function saveSettings(settings) {
  await chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: settings
  });
}

// Add kid ID
async function addKidId(kidId) {
  const settings = await getSettings();
  if (!settings.kidIds.includes(kidId)) {
    settings.kidIds.push(kidId);
    await saveSettings(settings);
  }
}

// Remove kid ID
async function removeKidId(kidId) {
  const settings = await getSettings();
  settings.kidIds = settings.kidIds.filter(id => id !== kidId);
  await saveSettings(settings);
}

// Update auth headers
async function updateAuthHeaders(authHeaders) {
  const settings = await getSettings();
  settings.authHeaders = authHeaders;
  await saveSettings(settings);
}

// Update parent mode
async function updateParentMode(isParentMode) {
  const settings = await getSettings();
  settings.isParentMode = isParentMode;
  await saveSettings(settings);
}


// Get logs from storage
async function getLogs() {
  const result = await chrome.storage.local.get([STORAGE_KEYS.LOGS]);
  return result[STORAGE_KEYS.LOGS] || [];
}

// Add log entry (keep only last 20 entries)
async function addLog(logEntry) {
  const logs = await getLogs();
  logs.unshift({
    timestamp: new Date().toISOString(),
    ...logEntry
  });
  
  await chrome.storage.local.set({
    [STORAGE_KEYS.LOGS]: logs.slice(0, 20)
  });
}