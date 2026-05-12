const STORAGE_KEY = 'ip-checker.entries';
const DEFAULT_ENTRIES = [
  {
    name: 'Example IP',
    ip: '75.54.12.35'
  },
  {
    name: 'Second IP',
    ip: '22.14.18.38'
  }
];

const currentIpElement = document.getElementById('current-ip');
const statusElement = document.getElementById('status');
const listElement = document.getElementById('ip-list');
const matchBadgeElement = document.getElementById('match-badge');
const jsonInputElement = document.getElementById('json-input');
const saveJsonButton = document.getElementById('save-json');
const resetJsonButton = document.getElementById('reset-json');
const editorPanelElement = document.getElementById('editor-panel');
const toggleEditorButton = document.getElementById('toggle-editor');

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle('error', isError);
}

function normalizeEntries(data) {
  if (!Array.isArray(data)) {
    throw new Error('JSON must be an array.');
  }

  return data
    .filter((entry) => entry && typeof entry.name === 'string' && typeof entry.ip === 'string')
    .map((entry) => ({
      name: entry.name.trim(),
      ip: entry.ip.trim()
    }));
}

function formatEntries(entries) {
  return JSON.stringify(entries, null, 2);
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, formatEntries(entries));
}

function loadStoredEntries() {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    saveEntries(DEFAULT_ENTRIES);
    return [...DEFAULT_ENTRIES];
  }

  return normalizeEntries(JSON.parse(rawValue));
}

function syncEditor(entries) {
  jsonInputElement.value = formatEntries(entries);
}

function setEditorVisibility(isOpen) {
  editorPanelElement.hidden = !isOpen;
  toggleEditorButton.setAttribute('aria-expanded', String(isOpen));
  toggleEditorButton.textContent = isOpen ? 'Hide Address Editor' : 'Show Address Editor';
}

function renderEntries(entries, currentIp) {
  const fragment = document.createDocumentFragment();
  let hasMatch = false;

  for (const entry of entries) {
    const item = document.createElement('li');
    item.className = 'ip-item';

    if (entry.ip === currentIp) {
      item.classList.add('match');
      hasMatch = true;
    }

    const identity = document.createElement('div');
    identity.className = 'identity';

    const name = document.createElement('span');
    name.className = 'name';
    name.textContent = entry.name;

    const ip = document.createElement('span');
    ip.className = 'ip';
    ip.textContent = entry.ip;

    identity.append(name);
    item.append(identity, ip);
    fragment.append(item);
  }

  listElement.replaceChildren(fragment);
  matchBadgeElement.hidden = !hasMatch;
}

async function loadCurrentIp() {
  const response = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch the public IP address.');
  }

  const data = await response.json();

  if (!data || typeof data.ip !== 'string') {
    throw new Error('The IP API response is invalid.');
  }

  return data.ip.trim();
}

function updateView(entries, currentIp) {
  renderEntries(entries, currentIp);

  if (!currentIp) {
    setStatus('The list was loaded locally. Failed to fetch the current IP address.', true);
    return;
  }

  setStatus(
    matchBadgeElement.hidden
      ? 'The current address is not on the list.'
      : 'The current address matched an entry on the list.'
  );
}

async function init() {
  let entries;
  let currentIp = '';

  try {
    entries = loadStoredEntries();
    syncEditor(entries);
  } catch (error) {
    entries = [...DEFAULT_ENTRIES];
    saveEntries(entries);
    syncEditor(entries);
    setStatus('The saved list was invalid. Default data has been restored.', true);
  }

  updateView(entries, currentIp);

  toggleEditorButton.addEventListener('click', () => {
    setEditorVisibility(editorPanelElement.hidden);
  });

  saveJsonButton.addEventListener('click', () => {
    try {
      const nextEntries = normalizeEntries(JSON.parse(jsonInputElement.value));
      saveEntries(nextEntries);
      syncEditor(nextEntries);
      updateView(nextEntries, currentIp);
    } catch (error) {
      setStatus(`Failed to save the list: ${error.message}`, true);
    }
  });

  resetJsonButton.addEventListener('click', () => {
    saveEntries(DEFAULT_ENTRIES);
    syncEditor(DEFAULT_ENTRIES);
    updateView(DEFAULT_ENTRIES, currentIp);
  });

  setEditorVisibility(false);

  try {
    currentIp = await loadCurrentIp();
    currentIpElement.textContent = currentIp;
    updateView(entries, currentIp);
  } catch (error) {
    currentIpElement.textContent = 'No data';
    updateView(entries, currentIp);
  }
}

init();
