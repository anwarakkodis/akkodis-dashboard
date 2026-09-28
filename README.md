# Akkodis Blog Studio

A no-code article composer for editors preparing HTML for Sitecore.

Run `npm start`, then open http://localhost:3000. Requires Node.js; no package installation is needed. Run `npm run check` for JavaScript syntax checks.

Includes editable content blocks, two columns, public image URLs and alt text, quotes, lists, callouts, buttons, special characters, block ordering and duplication, templates, browser-local drafts, responsive preview, and copy/download HTML export. Content is escaped and links are restricted to HTTP/HTTPS. Export is a script-free HTML fragment with inline styles and wrapping columns.

Drafts are local to this browser, not a shared service. The initial sample image is externally hosted on Unsplash; replace it with an approved corporate media URL. Fonts load from Google Fonts with system fallbacks. Production rollout needs authentication, shared storage, workflow decisions, and verification of allowed tags/styles in the target Sitecore field and corporate content-security policy. No Sitecore connection or publishing credentials are configured.
