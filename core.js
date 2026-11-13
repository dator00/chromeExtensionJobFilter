(function (root) {
  const defaults = { enabled: true, hidePromoted: true, maxDays: 7, hideUnknown: false };
  function parseAge(value, now = Date.now()) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return null;
    if (/^(just posted|just now|today|new|active today)$/.test(text)) return 0;
    if (/^yesterday$/.test(text)) return 1;
    const match = text.match(/(?:^|\b)(\d+)\s*(\+)?\s*(minute|min|hour|hr|day|week|month|year)s?\b/);
    if (match) {
      const scale = { minute:1/1440, min:1/1440, hour:1/24, hr:1/24, day:1, week:7, month:30, year:365 };
      return Number(match[1]) * scale[match[3]];
    }
    // Only parse explicit machine-readable dates, never arbitrary job text.
    if (/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text)) {
      const stamp = Date.parse(text);
      return Number.isFinite(stamp) ? Math.max(0, (now-stamp)/86400000) : null;
    }
    return null;
  }
  // Accept only complete posting labels here, not experience or benefit text.
  function parsePostingLabel(value) {
    const text = String(value || '').replace(/\s+/g, ' ').trim()
      .replace(/^(?:posted|re[ -]?posted)\s*:?\s*/i, '');
    if (!/^(?:\d+\s*\+?\s*(?:minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?)\s+ago|today|yesterday|just posted|just now|new)$/i.test(text)) return null;
    return parseAge(text);
  }
  function reason(info, settings) {
    if (!settings.enabled) return '';
    if (settings.hidePromoted && info.promoted) return 'promoted';
    if (info.age === null) return settings.hideUnknown ? 'unknown date' : '';
    return Number(settings.maxDays) > 0 && info.age > Number(settings.maxDays) ? 'old' : '';
  }
  root.JobFilter = { defaults, parseAge, parsePostingLabel, reason };
  if (typeof module !== 'undefined') module.exports = root.JobFilter;
})(globalThis);
