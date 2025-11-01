#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const admin = require('firebase-admin');

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return null;
  }
  throw new Error(
    'Set FIREBASE_SERVICE_ACCOUNT with a JSON credential or GOOGLE_APPLICATION_CREDENTIALS pointing to a service account file.'
  );
};

const initializeFirebase = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
};

const readContent = async () => {
  const contentPath = path.resolve(__dirname, '..', 'content', 'siteContent.json');
  const data = await fs.readFile(contentPath, 'utf8');
  return JSON.parse(data);
};

const seedContent = async () => {
  initializeFirebase();
  const firestore = admin.firestore();
  const content = await readContent();

  const entries = Object.entries(content);
  if (entries.length === 0) {
    console.log('No content found to seed.');
    return;
  }

  console.log(`Seeding ${entries.length} Firestore documents…`);
  for (const [docId, docData] of entries) {
    await firestore.collection('siteContent').doc(docId).set(docData, { merge: false });
    console.log(`✓ siteContent/${docId} updated`);
  }
  console.log('Content seeding complete.');
};

seedContent().catch((error) => {
  console.error('Failed to seed Firestore content', error);
  process.exitCode = 1;
});