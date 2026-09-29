# Validation — 2026-09-29

- `node scripts/build.mjs`: passed. Produces comparison, Quiet Cinema, Studio and 404 pages.
- `node scripts/check.mjs`: passed. Validates project fields, unique IDs, local media, HTTPS source links, optional-content schema and generated local links/anchors.
- JavaScript syntax checks: passed.
- Rendered in installed Chrome using Playwright at 1440, 390 and 320 pixels: all three pages returned HTTP 200, had no horizontal overflow and loaded every in-page image after scrolling.
- Both designs: film dialogs open, Escape closes, keyboard focus returns to the originating control.
- Image-motion pause/resume and reduced-motion preference: passed.
- Video: clicking play creates the correct Vimeo embed; closing the dialog removes the iframe and stops its lifecycle. The automated browser received Vimeo's connection-security restriction. **Successful video streaming was not verified**. The original “Watch on Vimeo” link is always provided so visitors can open Vimeo directly.
- No browser JavaScript errors observed in the interaction checks.
- Content reviewed against the original archive, FIRST, Vimeo and AIDC sources. Image descriptions checked against downloaded media.

This validates the website and its local interactions, not third-party video availability in every visitor's browser, ownership transfer, or custom-domain DNS. No DNS records were changed.
