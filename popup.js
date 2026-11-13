(async () => {
  const ids = Object.keys(JobFilter.defaults);
  const saved = document.getElementById('saved');
  try {
    const settings = await chrome.storage.local.get(JobFilter.defaults);
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el.type === 'checkbox') el.checked = settings[id]; else el.value = settings[id];
      el.addEventListener('change', async () => {
        try {
          await chrome.storage.local.set({ [id]: el.type === 'checkbox' ? el.checked : Number(el.value) });
          saved.textContent = 'Saved. Open job results update automatically.';
          setTimeout(refresh, 300);
        } catch { saved.textContent = 'Could not save. Please reopen the extension.'; }
      });
    }
    await refresh();
  } catch { saved.textContent = 'Could not load settings. Please reopen the extension.'; }
  async function refresh() {
    const status = document.getElementById('status');
    try {
      const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
      const data = await chrome.tabs.sendMessage(tab.id, { type:'job-filter-status' });
      status.textContent = `${data.hidden} of ${data.total} loaded job cards hidden · ${data.unknown} without a readable date.`;
    } catch { status.textContent = 'Open job results on a supported site. Refresh any tabs opened before installation.'; }
  }
})();
