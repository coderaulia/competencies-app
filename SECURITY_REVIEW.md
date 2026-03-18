# Security Review

This repo is still a local-development app, but the most obvious security gaps were reduced in the current pass.

## Fixed now

- Backend CRUD and analytics routes now require authentication, with only the public employee lookup endpoints left open.
- Passwords are now stored as `scrypt` hashes instead of plaintext in the local JSON database.
- Password reset requests now persist only a token hash, not the raw reset token.
- Login, register, password reset, and upload routes now have basic in-memory rate limiting.
- Backend CORS is restricted to configured local frontend origins, and cookie credentials are disabled.
- JSON request bodies now have explicit size limits, and multipart uploads now reject oversized payloads.
- Frontend auth state now uses `sessionStorage` instead of longer-lived local persistence.
- The PDF viewer license key was removed from source code and moved to `VITE_WEBVIEWER_LICENSE_KEY`.
- Demo credentials are no longer shown in the login UI unless `VITE_SHOW_DEMO_CREDENTIALS="true"`.
- Debug-heavy frontend console output was removed from the active auth, employment, uploader, publication, and analytics paths.
- The ECharts wrapper no longer relies on `new Function`, which improves CSP compatibility.

## Current status by category

- XSS: no direct `v-html` or `dangerouslySetInnerHTML` sink was found in the active app paths reviewed in this pass.
- SQL injection: not currently applicable because the local backend uses a JSON store, not SQL.
- Tampering: improved by requiring auth on generic API routes and reducing open mutation surface.
- CSRF: reduced because the frontend uses bearer tokens and fetch now omits credentials; this backend is not using cookie auth.
- DDoS and brute force: partially mitigated by basic per-IP in-memory rate limiting and request-size limits.
- Auth: improved, but still local-dev grade because bearer sessions remain in memory and there is no MFA or device/session management UI.
- Console leak: high-noise debug logs were removed from active flows.
- Source-code secret leak: improved by removing the embedded WebViewer license key from source.

## Remaining risks

- Reset tokens are still returned by the reset-request API in local mode because there is no mail delivery flow yet.
- The local backend still uses a JSON file instead of a database with stronger access controls, auditing, and transactional guarantees.
- Mock publication documents are still directly fetchable by URL; a production backend should use signed/private document access.
- Rate limiting is memory-only, so it resets on server restart and does not protect across multiple backend instances.
- Client-side bearer tokens remain readable by injected scripts within the same browser session, so strong CSP and stricter input/output handling are still important.
