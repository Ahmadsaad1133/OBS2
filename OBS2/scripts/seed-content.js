#!/usr/bin/env node
const fs = require('fs/promises');
const path = require('path');
const CONTENT_PATH = path.resolve(__dirname, '..', 'content', 'siteContent.json');
const run = async () => {
  const raw = await fs.readFile(CONTENT_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  await fs.writeFile(CONTENT_PATH, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
  console.log('Formatted content/siteContent.json. Firestore seeding is no longer required.');
};

run().catch((error) => {
  console.error('Failed to format managed content JSON', error);
  process.exitCode = 1;
});