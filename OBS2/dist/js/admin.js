
const statusEl = document.querySelector('[data-admin-status]');
const warningEl = document.querySelector('[data-admin-warning]');
const editorSection = document.getElementById('admin-panel');
const contentField = document.getElementById('managed-content');
const copyButton = document.querySelector('[data-copy-content]');
const downloadButton = document.querySelector('[data-download-content]');
const refreshButton = document.querySelector('[data-refresh-content]');

const setStatus = (message, variant = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.variant = variant;
};

const showWarning = (message) => {
  if (!warningEl) return;
  warningEl.textContent = message;
  warningEl.hidden = false;
};

const hideLegacyAuth = () => {
  const authSection = document.getElementById('auth-section');
  if (authSection) {
    authSection.querySelectorAll('form, button').forEach((node) => {
      node.remove();
    });
  }
};

const loadContent = async () => {
  if (!contentField) return;

  try {
    setStatus('Loading managed content…');
    const response = await fetch('content/siteContent.json', { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const json = await response.json();
    contentField.value = JSON.stringify(json, null, 2);
    setStatus('Loaded content/siteContent.json. Edit locally and rebuild to publish.', 'success');
  } catch (error) {
    console.error('Failed to load managed content', error);
    setStatus('Unable to load managed content. Check the console for details.', 'error');
  }
};

const copyContent = async () => {
  if (!contentField) return;

  try {
    await navigator.clipboard.writeText(contentField.value);
    setStatus('Copied JSON to clipboard.', 'success');
  } catch (error) {
    console.warn('Clipboard copy failed', error);
    setStatus('Copy failed. Select the text manually and press Ctrl/Cmd+C.', 'error');
  }
};

const downloadContent = () => {
  if (!contentField) return;
  const blob = new Blob([contentField.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'siteContent.json';
  anchor.rel = 'noopener';
  anchor.click();
  URL.revokeObjectURL(url);
  setStatus('Downloaded JSON file.', 'success');
};

hideLegacyAuth();
if (editorSection) {
  editorSection.hidden = false;
}
if (warningEl) {
  showWarning('Firestore has been removed. Manage content via content/siteContent.json.');
}

loadContent();
copyButton?.addEventListener('click', (event) => {
  event.preventDefault();
  copyContent();
});

downloadButton?.addEventListener('click', (event) => {
  event.preventDefault();
  downloadContent();
});
refreshButton?.addEventListener('click', (event) => {
  event.preventDefault();
  loadContent();
});