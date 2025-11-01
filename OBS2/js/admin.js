import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  allowedAdminEmails,
  hasAdminEmailRestrictions,
  isConfigComplete
} from './firebase.js';

const loginForm = document.getElementById('admin-login-form');
const adminPanel = document.getElementById('admin-panel');
const authSection = document.getElementById('auth-section');
const statusEl = document.querySelector('[data-admin-status]');
const warningEl = document.querySelector('[data-admin-warning]');
const panelActions = adminPanel?.querySelector('.admin-panel__actions');
const adminEditors = Array.from(document.querySelectorAll('[data-admin-doc]'));

const lowerCaseAllowedEmails = allowedAdminEmails.map((email) => email.toLowerCase());
if (!hasAdminEmailRestrictions) {
  console.warn(
    'Admin email restrictions are disabled. Update js/firebase.js to specify allowedAdminEmails for production environments.'
  );
}

const isEmailAuthorised = (email) => {
  if (!email) return false;
  if (!hasAdminEmailRestrictions) return true;
  return lowerCaseAllowedEmails.includes(email.toLowerCase());
};
const isFirebaseReady = Boolean(isConfigComplete && auth && db);

if (!isFirebaseReady) {
  loginForm?.setAttribute('aria-disabled', 'true');
  loginForm?.setAttribute('data-disabled', 'true');
  loginForm?.querySelectorAll('input, button').forEach((field) => {
    field.disabled = true;
  });
  if (warningEl) {
    warningEl.hidden = false;
  }
}

const setGlobalStatus = (message, variant = 'info') => {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.variant = variant;
};

const setEditorStatus = (editor, message, variant = 'info') => {
  const status = editor.querySelector('.admin-status');
  if (!status) return;
  status.textContent = message;
  status.dataset.variant = variant;
};

const serializeData = (data) => JSON.stringify(data, null, 2);

const parseEditorValue = (editor) => {
  const textarea = editor.querySelector('textarea');
  if (!textarea) {
    throw new Error('Missing textarea element for editor');
  }
  const raw = textarea.value.trim();
  if (!raw) {
    throw new Error('Provide JSON content before saving.');
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Invalid JSON. Ensure the document is valid JSON before saving.');
  }
};

const populateEditor = async (editor) => {
  if (!db) return;
  const docId = editor.dataset.adminDoc;
  if (!docId) return;

  try {
    setEditorStatus(editor, 'Loading Firestore content…');
    const snapshot = await getDoc(doc(db, 'siteContent', docId));
    if (!snapshot.exists()) {
      setEditorStatus(
        editor,
        'No document found in Firestore. Saving will create a new document with this JSON.',
        'warning'
      );
      return;
    }

    const data = snapshot.data();
    const textarea = editor.querySelector('textarea');
    if (textarea) {
      textarea.value = serializeData(data);
    }
    setEditorStatus(editor, 'Content loaded from Firestore.', 'success');
  } catch (error) {
    console.error('Failed to load document', docId, error);
    setEditorStatus(editor, 'Unable to load data. Check the console for details.', 'error');
  }
};

const saveEditor = async (editor) => {
  if (!db || !auth?.currentUser) {
    setEditorStatus(editor, 'You must be signed in to save changes.', 'error');
    return;
  }

  const currentEmail = auth.currentUser.email;
  if (!isEmailAuthorised(currentEmail)) {
    setEditorStatus(editor, 'Your account is not authorised to edit content.', 'error');
    return;
  }

  const docId = editor.dataset.adminDoc;
  if (!docId) return;

  try {
    const data = parseEditorValue(editor);
    const payload = {
      ...data,
      metadata: {
        updatedBy: auth.currentUser.email ?? 'unknown',
        updatedAt: serverTimestamp()
      }
    };

    await setDoc(doc(db, 'siteContent', docId), payload, { merge: false });
    setEditorStatus(editor, 'Content saved successfully.', 'success');
  } catch (error) {
    console.error('Failed to save document', docId, error);
    setEditorStatus(editor, error.message ?? 'Save failed. See console for details.', 'error');
  }
};

const togglePanelsForUser = (user) => {
  const isAuthorised = isEmailAuthorised(user?.email ?? '');
  if (isAuthorised) {
    authSection?.setAttribute('hidden', 'true');
    adminPanel?.removeAttribute('hidden');
    setGlobalStatus(`Signed in as ${user.email}.`);
    adminEditors.forEach((editor) => {
      const textarea = editor.querySelector('textarea');
      if (textarea && !textarea.value) {
        populateEditor(editor);
      }
    });
  } else {
    adminPanel?.setAttribute('hidden', 'true');
    authSection?.removeAttribute('hidden');
    if (user && user.email && !isAuthorised) {
      setGlobalStatus('This account is not authorised. Please sign in with an approved email.', 'error');
      signOut(auth);
    } else {
      setGlobalStatus('Provide your administrator credentials to edit the live marketing copy stored in Firestore.');
    }
  }
};

if (isFirebaseReady && auth) {
  onAuthStateChanged(auth, (user) => {
    togglePanelsForUser(user);
  });
}

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isFirebaseReady || !auth) {
    setGlobalStatus('Firebase is not configured. Unable to sign in.', 'error');
    return;
  }

  const formData = new FormData(loginForm);
  const email = formData.get('email')?.toString().trim() ?? '';
  const password = formData.get('password')?.toString() ?? '';

  if (!email || !password) {
    setGlobalStatus('Email and password are required.', 'error');
    return;
  }

  try {
    setGlobalStatus('Signing in…');
    await signInWithEmailAndPassword(auth, email, password);
    setGlobalStatus('Authentication successful.', 'success');
  } catch (error) {
    console.error('Admin sign-in failed', error);
    setGlobalStatus('Unable to authenticate. Check your credentials and try again.', 'error');
  }
});

panelActions?.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const action = target.dataset.action;
  if (!action) return;

  if (action === 'sign-out' && auth) {
    await signOut(auth);
    setGlobalStatus('Signed out.');
  }

  if (action === 'refresh-all') {
    adminEditors.forEach((editor) => {
      const textarea = editor.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
      }
      populateEditor(editor);
    });
  }
});

adminEditors.forEach((editor) => {
  editor.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const action = target.dataset.action;
    if (!action) return;

    if (action === 'refresh') {
      populateEditor(editor);
    }

    if (action === 'save') {
      saveEditor(editor);
    }
  });
});