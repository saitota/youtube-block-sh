// Settings page logic

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadLogs();
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('addKidBtn').addEventListener('click', handleAddKid);
  document.getElementById('saveAuthBtn').addEventListener('click', handleSaveAuth);
  document.getElementById('parentModeCheck').addEventListener('change', handleParentModeChange);
  
  document.getElementById('kidIdInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddKid();
  });
}

async function loadSettings() {
  const settings = await getSettings();
  
  document.getElementById('parentModeCheck').checked = settings.isParentMode;
  document.getElementById('authInput').value = settings.authHeaders.authorization;
  document.getElementById('cookieInput').value = settings.authHeaders.cookie;
  
  updateKidsList(settings.kidIds);
  updateAuthInputsState(settings.isParentMode);
}

function updateKidsList(kidIds) {
  const list = document.getElementById('kidsList');
  list.innerHTML = '';
  
  kidIds.forEach(kidId => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${kidId}</span>
      <button class="remove-btn" onclick="handleRemoveKid('${kidId}')">Remove</button>
    `;
    list.appendChild(li);
  });
}


async function handleAddKid() {
  const input = document.getElementById('kidIdInput');
  const kidId = input.value.trim();
  
  if (!kidId) return;
  
  await addKidId(kidId);
  input.value = '';
  const settings = await getSettings();
  updateKidsList(settings.kidIds);
}

async function handleRemoveKid(kidId) {
  await removeKidId(kidId);
  const settings = await getSettings();
  updateKidsList(settings.kidIds);
}

async function handleSaveAuth() {
  const authorization = document.getElementById('authInput').value.trim();
  const cookie = document.getElementById('cookieInput').value.trim();
  
  if (!authorization || !cookie) {
    alert('Both Authorization and Cookie are required');
    return;
  }
  
  await updateAuthHeaders({ authorization, cookie });
  alert('Authentication headers saved successfully');
}


function updateAuthInputsState(isParentMode) {
  const authInput = document.getElementById('authInput');
  const cookieInput = document.getElementById('cookieInput');
  const saveBtn = document.getElementById('saveAuthBtn');
  
  authInput.disabled = isParentMode;
  cookieInput.disabled = isParentMode;
  saveBtn.disabled = isParentMode;
  
  if (isParentMode) {
    authInput.placeholder = "Auto-fetched from browser";
    cookieInput.placeholder = "Auto-fetched from browser";
  } else {
    authInput.placeholder = "SAPISIDHASH...";
    cookieInput.placeholder = "YSC=...";
  }
}

async function handleParentModeChange() {
  const isParentMode = document.getElementById('parentModeCheck').checked;
  await updateParentMode(isParentMode);
  updateAuthInputsState(isParentMode);
  
  if (isParentMode) {
    document.getElementById('authInput').value = '';
    document.getElementById('cookieInput').value = '';
  } else {
    const settings = await getSettings();
    document.getElementById('authInput').value = settings.authHeaders.authorization;
    document.getElementById('cookieInput').value = settings.authHeaders.cookie;
  }
}


async function loadLogs() {
  const logs = await getLogs();
  const container = document.getElementById('logsList');
  
  container.innerHTML = '';
  
  if (logs.length === 0) {
    container.innerHTML = '<div class="log-entry">No activity logs yet</div>';
    return;
  }
  
  logs.forEach(log => {
    const div = document.createElement('div');
    div.className = `log-entry ${log.success ? 'success' : 'error'}`;
    
    div.innerHTML = `
      <div class="log-timestamp">${new Date(log.timestamp).toLocaleString()}</div>
      <div class="log-channel">@${log.channelName}</div>
      <div class="log-result">${log.success ? 'Success' : 'Failed'} (${log.kidCount} kids)</div>
      ${log.errors ? `<div class="log-errors">${log.errors}</div>` : ''}
    `;
    container.appendChild(div);
  });
}