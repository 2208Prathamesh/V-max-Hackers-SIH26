/**
 * WeatherGPT History Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const appSidebar = document.getElementById('appSidebar');
  const historySearchInput = document.getElementById('historySearchInput');
  const hTabBtns = document.querySelectorAll('.h-tab-btn');
  const convoItemRows = document.querySelectorAll('.convo-item-row');
  const historyGroupSections = document.querySelectorAll('.history-group-section');
  const toolbarDateBtn = document.getElementById('toolbarDateBtn');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');
  const dateRangeSelect = document.getElementById('dateRangeSelect');
  const sortBySelect = document.getElementById('sortBySelect');
  const storageUpgradeBtn = document.getElementById('storageUpgradeBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const historyLangBtn = document.getElementById('historyLangBtn');
  const historyNotifBtn = document.getElementById('historyNotifBtn');
  const convoMenuBtns = document.querySelectorAll('.convo-menu-btn');

  // Checkboxes
  const chkGenQueries = document.getElementById('chkGenQueries');
  const chkWeatherForecast = document.getElementById('chkWeatherForecast');
  const chkAlertsWarnings = document.getElementById('chkAlertsWarnings');
  const chkAirQuality = document.getElementById('chkAirQuality');
  const chkTravel = document.getElementById('chkTravel');
  const chkOther = document.getElementById('chkOther');

  // Sidebar toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }
  if (sidebarCollapseBtn && appSidebar) {
    sidebarCollapseBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-collapsed');
    });
  }

  // 1. Search conversations in real-time
  historySearchInput?.addEventListener('input', () => {
    const query = historySearchInput.value.toLowerCase().trim();
    convoItemRows.forEach(row => {
      const title = (row.getAttribute('data-title') || '').toLowerCase();
      const match = title.includes(query);
      row.style.display = match ? 'flex' : 'none';
    });
    updateGroupVisibility();
  });

  // 2. Period Filter Tabs
  hTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      hTabBtns.forEach(b => b.classList.remove('active-h-tab'));
      btn.classList.add('active-h-tab');
      const period = btn.getAttribute('data-period');
      filterByPeriod(period);
    });
  });

  function filterByPeriod(period) {
    historyGroupSections.forEach(section => {
      const group = section.getAttribute('data-group');
      if (period === 'all' || period === 'custom') {
        section.style.display = 'flex';
      } else if (period === 'today') {
        section.style.display = (group === 'today') ? 'flex' : 'none';
      } else if (period === 'yesterday') {
        section.style.display = (group === 'yesterday') ? 'flex' : 'none';
      } else if (period === 'this-week') {
        section.style.display = (group === 'today' || group === 'yesterday') ? 'flex' : 'none';
      } else if (period === 'this-month') {
        section.style.display = 'flex';
      }
    });
  }

  // 3. Conversation Type Checkbox Filtering
  const checkboxes = [chkGenQueries, chkWeatherForecast, chkAlertsWarnings, chkAirQuality, chkTravel, chkOther];
  checkboxes.forEach(chk => {
    chk?.addEventListener('change', applyTypeFilters);
  });

  function applyTypeFilters() {
    const showGen = chkGenQueries?.checked;
    const showForecast = chkWeatherForecast?.checked;
    const showAlert = chkAlertsWarnings?.checked;
    const showAir = chkAirQuality?.checked;
    const showTravel = chkTravel?.checked;
    const showOther = chkOther?.checked;

    convoItemRows.forEach(row => {
      const type = row.getAttribute('data-type');
      let visible = false;

      if (type === 'general' && showGen) visible = true;
      if (type === 'forecast' && showForecast) visible = true;
      if (type === 'alert' && showAlert) visible = true;
      if (type === 'air-quality' && showAir) visible = true;
      if (type === 'travel' && showTravel) visible = true;
      if (type === 'other' && showOther) visible = true;

      // If no box checked, default show all
      if (!showGen && !showForecast && !showAlert && !showAir && !showTravel && !showOther) {
        visible = true;
      }

      row.style.display = visible ? 'flex' : 'none';
    });

    updateGroupVisibility();
  }

  function updateGroupVisibility() {
    historyGroupSections.forEach(section => {
      const visibleRows = section.querySelectorAll('.convo-item-row[style*="display: flex"], .convo-item-row:not([style*="display: none"])');
      section.style.display = visibleRows.length > 0 ? 'flex' : 'none';
    });
  }

  // 4. Clear All Filters
  clearAllFiltersBtn?.addEventListener('click', () => {
    if (chkGenQueries) chkGenQueries.checked = true;
    if (chkWeatherForecast) chkWeatherForecast.checked = true;
    if (chkAlertsWarnings) chkAlertsWarnings.checked = true;
    if (chkAirQuality) chkAirQuality.checked = false;
    if (chkTravel) chkTravel.checked = false;
    if (chkOther) chkOther.checked = false;

    if (historySearchInput) historySearchInput.value = '';
    if (dateRangeSelect) dateRangeSelect.value = 'all';
    if (sortBySelect) sortBySelect.value = 'recent';

    hTabBtns.forEach(b => b.classList.remove('active-h-tab'));
    hTabBtns[0]?.classList.add('active-h-tab');

    convoItemRows.forEach(r => r.style.display = 'flex');
    historyGroupSections.forEach(s => s.style.display = 'flex');

    showToast('Filters reset to default view.', 'success');
  });

  // 5. Clicking on Conversation Rows
  convoItemRows.forEach(row => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.convo-menu-btn')) return;
      const title = row.getAttribute('data-title');
      showToast(`Loading conversation: "${title}"`, 'info');
      setTimeout(() => {
        window.location.href = `chat.html?topic=${encodeURIComponent(title)}`;
      }, 500);
    });
  });

  // 6. Three Dots Menu Button
  convoMenuBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.convo-item-row');
      const title = parent?.getAttribute('data-title') || 'Conversation';
      const action = confirm(`Options for "${title}":\n\nClick OK to Export Chat, or Cancel to keep.`);
      if (action) {
        showToast(`Exported transcripts for "${title}"`, 'success');
      }
    });
  });

  // 7. Toolbar actions & feedback
  toolbarDateBtn?.addEventListener('click', () => {
    showToast('Choose custom start and end dates from calendar.', 'info');
  });

  dateRangeSelect?.addEventListener('change', () => {
    showToast(`Filter range: ${dateRangeSelect.value}`, 'info');
  });

  sortBySelect?.addEventListener('change', () => {
    showToast(`Sorted by: ${sortBySelect.options[sortBySelect.selectedIndex].text}`, 'info');
  });

  storageUpgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Unlimited cloud history storage!', 'success');
  });

  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Advanced analytical tools unlocked!', 'success');
  });

  historyLangBtn?.addEventListener('click', () => {
    showToast('Language set to English.', 'info');
  });

  historyNotifBtn?.addEventListener('click', () => {
    showToast('All your weather conversations are securely synced.', 'info');
  });

  // Toast Helper
  function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }
});
