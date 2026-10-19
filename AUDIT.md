# Portfolio Project Audit

## Scope and architecture

This is a static GitHub Pages site with `index.html` as the main entry point,
`404.html` as the not-found page, and `cv.html` as a printable CV. The main
page uses `style.css` for layout and components and `script.js` for the
responsive navigation, scroll-scrubbed hero video, reduced-motion handling,
and EmailJS contact form. Images, two MP4 files, a PDF CV, `robots.txt`, and
`sitemap.xml` are stored in the repository. There is no package manifest,
build pipeline, or project test suite.

## Baseline findings

- The hero video source used by the page exists. Its 1920 × 814 MP4 is a
  landscape video rendered with `object-fit: cover`; the CSS applies a
  14px downward translation. The scroll-scrub logic is implemented in
  `script.js`; preserve that behavior and the existing framing.
- `.hero-meta` and `.hero-meta span::before` had CSS rules but no matching
  markup or JavaScript-generated element; the rules were verified unused.
- Seven custom properties in `:root` had no `var()` use in the stylesheet;
  a project-wide reference scan confirmed they were unused.
- The same `.hero { padding: 0; }` reset is repeated at three responsive
  breakpoints even though `.hero` has no base padding; the resets were
  redundant.
- `images/44b83b99-908e-40bb-52fc-f92029adb2ad.mp4` is not referenced by the
  inspected source. Its purpose is uncertain, so retain the asset.
- The other local image, video, stylesheet, script, and CV references are
  part of the existing site and must remain intact.
- The source has no formal automated tests or build scripts. Use browser
  checks and available syntax/diff checks for validation.
- Existing uncommitted changes to `style.css` and `script.js` are part of the
  baseline and are preserved; this audit does not reset, overwrite, commit,
  or push them.

## Cleanup performed

- Removed the verified-unused `.hero-meta` rules, seven unreferenced custom
  properties, and three redundant `.hero` padding resets. No HTML, JavaScript,
  media asset, or deployment file was removed.

## Validation

- `node --check script.js` and `git diff --check` passed.
- A post-cleanup static scan found no unused custom properties or CSS classes
  lacking an HTML/JavaScript reference.
- Browser checks passed at 320, 375, 430, 768, 1024, and 1440px, plus short
  viewports at 320 × 400 and 768 × 500: the hero content fit, the paragraph
  remained centered, and no horizontal overflow was detected.
- Browser checks confirmed the mobile navigation opens and closes, local
  anchor targets resolve, IDs are unique, images have `alt` attributes, and
  the `404.html` and `cv.html` pages load with titles.
- Chromium loaded and decoded the hero MP4, scroll-seeking advanced its
  current time, and reduced-motion emulation hid and paused the video.
- Local source references resolved. No JavaScript runtime errors were
  observed during the focused browser checks.

## Remaining cautions

- The unreferenced MP4 was retained because its purpose is unknown.
- `cv.html` retains its fixed `javascript:window.print()` link to preserve
  print behavior. It does not interpolate user input, but is a legacy
  JavaScript URL rather than a standard button handler.
- Physical Android Chrome and iOS Safari testing, and live external-service
  checks for Google Fonts and EmailJS, were not available in this audit.
