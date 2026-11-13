# Validation — 0.1.1

Passed Node filtering-rule tests, including Re-posted labels and rejecting unrelated experience/benefits text. Headless Chromium regression tests cover per-job ZipRecruiter card IDs, button titles, nested/comment-separated labels, changing age cutoffs, dynamically inserted cards, unknown-date controls, restoring hidden cards, detail-panel isolation and avoiding duplicate counts.

Also passed the original three-site browser fixtures and popup save checks. Replayed HTML fetched from the public ZipRecruiter software-engineer search in Chromium with network scripts blocked: all 20 cards were recognized; all lacked card dates and remained visible by default; enabling hide-unknown hid all 20. The selected detail panel’s date was not applied to unrelated cards.

Authenticated user pages and all layout experiments remain unverified. Browser tests stub the Chrome APIs and do not verify Chrome permission enforcement. The actual public-page capture remains a local scratch file, outside this repository.

Run rules: `node --test tests/core.test.cjs`.

For browser regressions, install Playwright in your development environment, install its Chromium browser (`npx playwright install chromium`), then run `node tests/ziprecruiter.browser.cjs`. Alternatively set `CHROMIUM_PATH` to an installed Chromium executable. Development tools are not needed to load the extension in Chrome.
