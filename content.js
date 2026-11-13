(() => {
  const { defaults, parseAge, parsePostingLabel, reason } = JobFilter;
  const host = location.hostname;
  const site = host.endsWith('linkedin.com') ? 'linkedin' : host.endsWith('indeed.com') ? 'indeed' : 'ziprecruiter';
  // Keep selectors narrow: only result cards, never the job detail panel.
  const adapters = {
    indeed: {
      cards: '.job_seen_beacon, .jobsearch-ResultsList > li:has(.jobTitle), [data-testid="slider_item"]:has(.jobTitle)',
      dates: '.date, [data-testid="myJobsStateDate"], [data-testid="job-age"], [data-testid="job-posted-date"]',
      labels: '[data-testid*="sponsor"], [data-testid*="promot"], .sponsoredJob, .sponsoredJobLabel'
    },
    linkedin: {
      cards: 'li.jobs-search-results__list-item, li.scaffold-layout__list-item:has(.job-card-container), .job-search-card, .base-card:has(.base-search-card__title)',
      dates: 'time, .job-search-card__listdate, .job-search-card__listdate--new, .job-card-container__listed-time, .job-card-container__footer-item',
      labels: '.job-card-container__footer-item, .job-card-list__footer-wrapper li'
    },
    ziprecruiter: {
      cards: 'li[data-testid^="job-card-item-"], article[data-testid^="job-card-"], article.job_result, .job_result, [data-testid="job-card"], article:has(a[href*="/jobs/"]), article:has(a[href*="/c/"])',
      dates: 'time, [data-testid="posted-row"], [data-testid="job-age"], [data-testid="posted-date"], .job_age, .posted_time',
      labels: '[data-testid*="sponsor"], [data-testid*="promot"]'
    }
  };
  const adapter = adapters[site];
  let settings = { ...defaults }, timer;
  let counts = { total:0, hidden:0, promoted:0, old:0, unknown:0 };
  const textOf = node => (node.textContent || '').replace(/\s+/g, ' ').trim();
  function inspect(card) {
    const labels = [...card.querySelectorAll(adapter.labels)];
    // A short standalone label avoids matching “promoted” in a job title or description.
    const promoted = labels.some(el => /^(promoted|sponsored)(?:\s*[·•].*)?$/i.test(textOf(el)) || /sponsor|promot/i.test(el.getAttribute('data-testid') || '')) ||
      [...card.querySelectorAll('span, li, small')].some(el => el.children.length === 0 && /^(promoted|sponsored)$/i.test(textOf(el)));
    let age = null;
    for (const el of card.querySelectorAll(adapter.dates)) {
      const candidate = parseAge(el.getAttribute('datetime') || textOf(el));
      if (candidate !== null) { age = candidate; break; }
    }
    // React can split a label over spans/comments. Read the complete short
    // label, including p/div layouts, without parsing arbitrary description text.
    if (age === null) {
      for (const el of card.querySelectorAll('span, small, li, p, div')) {
        if (el.closest('h1, h2, h3, h4, h5, h6')) continue;
        const candidate = parsePostingLabel(textOf(el));
        if (candidate !== null) { age = candidate; break; }
      }
    }
    return { promoted, age };
  }
  function scan() {
    counts = { total:0, hidden:0, promoted:0, old:0, unknown:0 };
    const all = [...document.querySelectorAll(adapter.cards)];
    const cards = all.filter(card => !all.some(other => other !== card && other.contains(card)));
    const active = new Set(cards);
    document.querySelectorAll('[data-job-filter-hidden]').forEach(card => {
      if (!active.has(card)) card.removeAttribute('data-job-filter-hidden');
    });
    for (const card of cards) {
      const info = inspect(card);
      const why = reason(info, settings);
      counts.total++;
      if (info.age === null) counts.unknown++;
      if (why) {
        counts.hidden++;
        if (why === 'promoted') counts.promoted++;
        if (why === 'old') counts.old++;
        if (card.getAttribute('data-job-filter-hidden') !== 'true') card.setAttribute('data-job-filter-hidden', 'true');
      } else card.removeAttribute('data-job-filter-hidden');
    }
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(scan, 150); }
  chrome.storage.local.get(defaults).then(value => { settings = value; scan(); }).catch(() => scan());
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    for (const key of Object.keys(defaults)) if (changes[key]) settings[key] = changes[key].newValue ?? defaults[key];
    schedule();
  });
  new MutationObserver(schedule).observe(document.documentElement, {
    childList:true, subtree:true, characterData:true, attributes:true,
    attributeFilter:['datetime','class','data-testid','aria-label','href']
  });
  // Re-evaluate timestamps on long-lived tabs.
  setInterval(schedule, 60000);
  chrome.runtime.onMessage.addListener((message, sender, respond) => {
    if (message.type === 'job-filter-status') { scan(); respond({ site, ...counts }); }
  });
})();
