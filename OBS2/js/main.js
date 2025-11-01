import {
  auth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  allowedAdminEmails
} from './js/firebase.js';

// ✅ Select your input fields and buttons
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const statusText = document.getElementById('status');

// ✅ Login function
loginBtn?.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (allowedAdminEmails.includes(user.email)) {
      statusText.textContent = `✅ Welcome Admin: ${user.email}`;
      statusText.style.color = 'green';
    } else {
      statusText.textContent = `🚫 Access denied for ${user.email}`;
      statusText.style.color = 'red';
      await signOut(auth);
    }
  } catch (error) {
    statusText.textContent = `❌ Login failed: ${error.message}`;
    statusText.style.color = 'red';
  }
});

// ✅ Auto-detect signed-in user
onAuthStateChanged(auth, (user) => {
  if (user) {
    statusText.textContent = `Signed in as: ${user.email}`;
    statusText.style.color = 'blue';
  } else {
    statusText.textContent = 'Not signed in';
    statusText.style.color = 'gray';
  }
});

// ✅ Logout function
logoutBtn?.addEventListener('click', async () => {
  await signOut(auth);
  statusText.textContent = 'Logged out';
  statusText.style.color = 'gray';
});
