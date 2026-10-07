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

## 2026-10-07 — Edition 04 interaction refinement

Scope: `/motion/` only (`src/motion.*` and the generated `dist/motion/`). Every file outside `dist/motion/` was byte-compared with the previous build and is unchanged, so `/elena/`, `/quiet/`, `/studio/` and the comparison entrance are untouched. `npm run build` and `npm run check` pass.

Method: headless Chromium (Playwright) at about 60Hz with synthetic mouse, keyboard and touch input, per-frame sampling of positions, transforms and opacity, screen recordings and contact sheets. The previous build was kept running beside the new one for side-by-side measurements. Two independent review rounds (six lenses plus a skeptic that reproduced each finding, then a re-verification and a final check) found issues that were fixed before delivery.

- Works: the floating follower was the cause of the reported feel. It trailed the pointer by about 81ms × speed with a 28px offset, so above roughly 345px/s the cursor sat inside the picture; it covered the film title in about 94% of hover frames and pinned at the window edge. Four alternatives were prototyped and measured with one shared script; an enhanced permanent still was chosen. Now: title covered 0%, no image moves with the pointer, hover feedback reaches 90% in about 140ms and rests by about 230ms, the title never moves, clicks at any moment open the film.
- Grid / Desk: the transition had never played (a 1px border change cancelled it on its first frame). It now plays in both directions (largest per-frame step about 15px, done in about 0.4–0.47s), rapid toggles end in the last-chosen mode, and an arrangement survives switching back and forth without drifting.
- Page changes: the window after arrival in which clicks were swallowed went from about 320ms to about 220ms (median); the Works still now becomes the film cover as one picture, also when images revalidate slowly.
- Viewer: opens at its final size (it used to open as a thin strip), never shows an empty frame or a stale picture at full strength, closes on a tap outside without clicking the page beneath, and returns focus.
- Stickers: pickup, settle and animated put-back; a sticker released on the logo, navigation or text glides clear; keyboard moves, resizes and touch were checked at 320–1440px.
- Phones and tablets: no horizontal overflow at 300–1440px; touch targets at least 44px; native scrolling over photographs on the Desk; the Move handle drags.
- Keyboard, reduced motion and no-JS: visible focus throughout; reduced motion removes zoom, travel and page transitions while dragging still works; without JavaScript every page reads and links normally.

Not tested: real touch hardware, real trackpads and mice, 120Hz displays (motion is time-based and was simulated at 30/120Hz), Safari and Firefox (features without support fall back to instant changes), screen-reader speech (the accessibility tree was checked). The site was not republished; the live preview still shows the previous version.
