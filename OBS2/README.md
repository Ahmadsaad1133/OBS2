# OBS Company Website

This repository contains the marketing site for **OBS**, a full-cycle software engineering studio
specialising in launch-ready applications and web platforms. The site is built with vanilla HTML,
CSS, and modern JavaScript modules.

## Project structure

```
├── index.html         # Landing page
├── about.html         # Company story and values
├── contact.html       # Project intake form connected to Firebase
├── css
│   └── styles.css     # Global site styles
└── js
    ├── common.js      # Shared UI behaviour + newsletter submission logic
    ├── contact.js     # Contact form Firestore integration
    └── firebase.js    # Firebase configuration and initialisation
```

## Firebase setup

1. Create a Firebase project (Firestore in Native mode) and a Web App from the Firebase console.
2. Copy the configuration snippet provided by Firebase and replace the placeholder values in
   `js/firebase.js`.
3. Enable Cloud Firestore in the Firebase console.

### Required collections

| Collection name           | Purpose                         | Sample document fields                                  |
| ------------------------- | ------------------------------- | ------------------------------------------------------- |
| `newsletterSubscriptions` | Stores newsletter signups       | `email` (string), `createdAt` (Firestore serverTimestamp) |
| `projectInquiries`        | Captures contact form projects  | `fullName`, `email`, `company`, `projectType`, `budget`, `timeline`, `message`, `createdAt` |

Both forms automatically add a `createdAt` field using `serverTimestamp()` to simplify sorting in
Firestore queries.

## Local development

Open `index.html` in a browser or serve the project with any static file server (for example,
`npx serve .`). The Firebase SDK is loaded via ES module CDN URLs so no additional build tooling is
required.