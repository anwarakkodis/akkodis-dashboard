# Akkodis Blog Studio

A no-code article composer for editors preparing HTML for Sitecore. It is a fully static site (works on GitHub Pages) with no server or database.

## Login

Five fixed login IDs (`AKK-001` … `AKK-005`) share one password. Both are configured in `logins.js`; the password is stored there as a SHA-256 hash. Anything in a static site is visible to visitors, so this is a light gate, not strong security.

## Storage and sharing

Pages are saved in the browser's localStorage, per login ID. "Share with login ID" copies a page into another ID's list **on the same browser**. To move work between computers, use Export skeleton / Import skeleton. Clearing browser data deletes saved pages, so export anything important.

## Run locally

Serve the folder with any static server, e.g. `python -m http.server`, and open it in a browser. (The old Node/Supabase server files remain in the repo but are no longer used.)
