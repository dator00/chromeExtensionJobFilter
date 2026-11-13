# Validation

Passed Node filtering-rule tests and headless Chromium synthetic-page tests for Indeed, LinkedIn, and ZipRecruiter. Browser checks covered fresh/old/promoted/unknown-date cards, dynamically inserted results, disabling and restoring cards, and hiding unknown dates. Popup checks covered loading defaults, saving changes, and rendering result counts.

Chrome installation and authenticated live site layouts have not been verified. Synthetic tests inject a minimal Chrome API stub; they do not validate Chrome permission enforcement. See README.md for installation and limitations.
