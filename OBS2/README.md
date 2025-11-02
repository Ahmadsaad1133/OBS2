# OBS Company Website

This repository contains the marketing site for **OBS**, a full-cycle software engineering studio
specialising in launch-ready applications and web platforms. The site is built with vanilla HTML,
CSS, and modern JavaScript modules.

## Project structure

```
├── index.html         # Landing page
├── about.html         # Company story and values
├── contact.html       # Redirects into the unified contact flow
├── content
│   └── siteContent.json  # Managed copy applied to each page
├── css
│   └── styles.css     # Global site styles
└── js
    ├── common.js      # Shared UI behaviour + mailto newsletter flow
    ├── contact.js     # Mailto-based project intake helper
    └── content.js     # Loads managed copy from content/siteContent.json
```

## Managed content

Firestore has been removed in favour of a zero-runtime, static content workflow. All editable copy
lives in `content/siteContent.json`. The `npm run build` task applies the JSON to each HTML page and
copies the assets into `dist/` for deployment. You can preview the current JSON bundle in
`admin.html`, which now offers copy/download helpers for the static file.

## Forms and inquiries

Without Firestore, both the contact form and newsletter signup use simple `mailto:` fallbacks. When a
visitor submits either form, their email client opens with a pre-populated draft addressed to
`12134189a@gmail.com`. Sending that draft completes the request without any client-side databases or
external SDKs.

## Local development

Open `index.html` in a browser or serve the project with any static file server (for example,
`npx serve .`). When using the mailto workflow you may prefer to develop with a local HTTP server so
that the browser can fetch `content/siteContent.json` without file-protocol restrictions.