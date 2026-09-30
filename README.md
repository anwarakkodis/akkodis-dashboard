# Akkodis Blog Studio

A no-code article composer for editors preparing HTML for Sitecore.

## Run locally

Requires Node.js 22.13 or later with built-in SQLite. Run `npm start`, then open http://localhost:3000. No package installation is needed. Run `npm run check` for JavaScript syntax checks.

On first start, the server creates the `admin` account. Its generated temporary password is in `data/initial-admin.txt`. Sign in and change it; the file is then removed. No public registration is available.

## Team workflow

- Open your account menu, then Manage team to create editor or administrator accounts. Give each teammate their generated temporary password; they must change it on first sign-in.
- Edits automatically save to your account. Save draft retries a failed save.
- My pages opens saved pages or reuses them as independent new drafts. Existing browser-only drafts can be imported there.
- Share layout sends a separate editable copy to another account, or exports a skeleton file containing layout and copy for import elsewhere.
- Export HTML produces the article fragment for pasting into Sitecore. Direct Sitecore publishing is not configured.

## Hosting and storage

The default server listens only on this computer. Team access requires a shared server and HTTPS. Configure `HOST` and `PORT` for your host, put the app behind an HTTPS reverse proxy, and set `STUDIO_SECURE_COOKIE=1` for secure session cookies. Keep the proxy's forwarded host consistent with the request Origin.

`STUDIO_DATA_DIR` selects the persistent data directory (default `data`). Back up its SQLite database using SQLite backup tooling, or stop the server before copying the entire data directory. Keep this directory private and outside source control. `STUDIO_ADMIN_PASSWORD` can set the initial password on an empty database; it does not reset existing accounts.

Passwords are salted and hashed; sessions use HttpOnly, SameSite cookies. Pages are scoped to their owner and sharing creates a copy. Account recovery, disabling accounts, and audit logs are not yet implemented.

Includes content blocks, independent column elements, rich text, brand color palettes, templates, responsive preview, layer ordering and duplication, and HTML export. Fonts load from Google Fonts with system fallbacks. Verify exported tags/styles in your target Sitecore field before publishing.

## Supabase database setup

The optional Supabase mode stores accounts, hashed passwords, sessions, and pages in Supabase Postgres. It retains the application's existing username login; it does not use Supabase Auth, and requires neither a publishable key nor JWKS for authentication. Tables deny direct browser access; authorization remains in the Node server.

1. Run `supabase-schema.sql` in your project's SQL Editor.
2. Rotate any secret key previously posted in chat. Put the replacement in `SUPABASE_SECRET_KEY` in `.env` (never browser code).
3. Set `STUDIO_STORAGE=supabase` in `.env` and restart the server. An empty database creates a new admin with a temporary password in `data/initial-admin.txt`.
4. Existing SQLite accounts/pages remain in `data/studio.sqlite`; they are not automatically transferred. Keep SQLite mode until any required content has been exported as skeleton files. Import these into the new account after switching.

Both storage modes require the shared Node server for team access. Keep `.env` private. This workspace now uses Supabase mode. The existing administrator account was migrated and verified; the original SQLite database is retained as a backup. No saved pages existed at migration time.
