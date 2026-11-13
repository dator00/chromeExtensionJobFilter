# Job Filter — Chrome extension

Hide promoted jobs and postings older than 1, 3, 7, 14, or 30 days on Indeed.com, LinkedIn Jobs, and ZipRecruiter.com. Includes an “Any time” setting. Defaults: enabled, promoted hidden, seven-day cutoff, unknown dates visible.

## Install
1. On this repository’s GitHub page, choose **Code → Download ZIP**. In Windows File Explorer, right-click the ZIP and choose **Extract All**. Keep the extracted folder in a permanent location.
2. Open `chrome://extensions` in Chrome and turn on **Developer mode**.
3. Choose **Load unpacked** and select the extracted `chromeExtensionJobFilter-main` folder containing `manifest.json` (open the outer folder if Windows creates an extra nesting level).
4. Refresh existing job-search tabs. Pin Job Filter from Chrome’s Extensions menu, then click it to change settings.

No build, account, API key, or server needed. Disable filtering in the popup to restore cards. Chrome’s Remove button uninstalls it.

## Update an existing installation
Download and extract the latest ZIP. Replace the files in the folder Chrome already loads, then open `chrome://extensions`, click Job Filter’s **Reload** button, and refresh your job-search tabs. Check **Details** for version 0.1.1. GitHub changes do not automatically update an unpacked extension.

## ZipRecruiter dates
Current result cards can use per-job IDs and button-based titles; version 0.1.1 recognizes this layout and “Re-posted” date labels, including labels split across elements. Some cards expose no date until the detail panel is opened. The extension does not transfer the selected job’s detail date to other cards or open every result. Use ZipRecruiter’s **Date posted** filter for date-limited search results, or enable **Hide jobs with no date** (this can hide all cards on layouts without card dates).

## How it works
Manifest V3 content scripts inspect job result cards on the three supported sites. A MutationObserver rechecks dynamically loaded cards. Cards are hidden reversibly with CSS. Settings persist locally across browser restarts and apply across supported sites. No analytics, network requests, application automation, or collection of job data. Only the storage permission is requested; site access is limited through content-script URL matches. Indeed country domains other than indeed.com are not included.

## Limits
This is a starter implementation using site-specific selectors, verified against synthetic browser fixtures rather than authenticated live job pages. Sites regularly change their markup and run layout experiments; adapt the selectors in `content.js` if cards stop matching. English labels are supported. A card must expose a recognizable promotion label or date to filter it; this cannot uncover concealed sponsorship or original dates behind reposts. Unknown dates stay visible unless you enable the corresponding setting. “30+ days” is treated conservatively as at least 30 days; weeks are seven days, months 30, years 365. A job at exactly the cutoff stays visible. Filtering affects loaded cards only and does not fetch replacements, change the site’s result totals, or advance pagination. Native date filters can help load more recent results.

## Files
- `manifest.json`: extension configuration and supported URLs.
- `core.js`: pure age parsing and filtering rules.
- `content.js`: site selectors, detection, dynamic updates, and counts.
- `popup.html`, `popup.css`, `popup.js`: settings UI.
- `content.css`: reversible card hiding.

To support a new site layout, update its `cards`, `dates`, and `labels` selectors, then reload the extension and refresh the job page. Keep card selectors narrow to avoid hiding detail panels or whole lists. Run `node --test tests/core.test.cjs` from this folder for the filtering-rule tests.
