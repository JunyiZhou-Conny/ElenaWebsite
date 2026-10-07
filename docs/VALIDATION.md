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

## 2026-10-06 — Elena Canva version

- Build and content/link checks pass for 7 generated pages. All third-version font, logo, still and local navigation references exist. `git diff --check` passes.
- Compared the exported Canva PDF to local rendering: original logo and matching fonts, orange/blue palette, homepage composition, centered project information, 4 stills in original order, real contact details. Press uses readable labels for the same source links.
- Browser checked at actual CSS widths 1242, 1023, 390 and 320px (the embedded browser has a display zoom). The four new routes have no horizontal overflow at 320 or 1023px. Desktop and phone layouts visually inspected.
- Clicked Home → Works → film → Contact → Home; browser Back and page refresh work. Email and Instagram targets match the supplied design. Full-resolution stills load when scrolled into view.
- The two old generated designs, their CSS/JS and shared content remain byte-for-byte unchanged from the previous commit. Only the comparison entrance gains the third option.
- A separate code review found tablet CONTACT overflow and missing spacing between inline mobile introduction spans; both fixed and rechecked.
- Navigation remains ordinary HTML links. Native view transitions last 160–300ms; reduced-motion CSS disables animation. The preview logged native transition cancellations during viewport/navigation inspection; these did not interrupt navigation. No application-script exception was observed. Browsers without native page transitions fall back to normal navigation.
- No video player or form was added. No custom-domain/DNS changes. All versions retain noindex.
