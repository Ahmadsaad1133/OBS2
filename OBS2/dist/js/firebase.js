import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
const firebaseConfig = {
  apiKey: "AIzaSyA-wgaD7DCc9Ck2kpTAU1WnNtr5JJUCts0",
  authDomain: "obs11-9c4ec.firebaseapp.com",
  projectId: "obs11-9c4ec",
  storageBucket: "obs11-9c4ec.firebasestorage.app",
  messagingSenderId: "324241361239",
  appId: "1:324241361239:web:a97a2914b09f26935b9612"
};

const isConfigComplete = Object.values(firebaseConfig).every(
  (value) => typeof value === 'string' && value.trim() !== '' && !value.includes('YOUR_FIREBASE')
);

let app;
let db;
let auth;
if (isConfigComplete) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  console.warn(
    'Firebase configuration is incomplete. Update js/firebase.js with your project credentials to enable data capture.'
  );
}

const rawAllowedAdminEmails = ['YOUR_ADMIN_EMAIL@example.com'];

const allowedAdminEmails = rawAllowedAdminEmails
  .map((email) => (typeof email === 'string' ? email.trim() : ''))
  .filter((email) => email && !email.toLowerCase().includes('your_admin_email'));

const hasAdminEmailRestrictions = allowedAdminEmails.length > 0;

export {
  app,
  db,
  auth,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  isConfigComplete,
  allowedAdminEmails,
  hasAdminEmailRestrictions
};