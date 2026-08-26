/**
 * WeatherGPT Alerts Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const alertCards = document.querySelectorAll('.alert-feed-card');
  const viewAlertBtns = document.querySelectorAll('.view-alert-btn');
  const alertModalOverlay = document.getElementById('alertModalOverlay');
  const closeAlertModalBtn = document.getElementById('closeAlertModalBtn');
  const modalAlertTitle = document.getElementById('modalAlertTitle');
  const modalAlertBody = document.getElementById('modalAlertBody');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const locationFilterSelect = document.getElementById('locationFilterSelect');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const subToggleChks = document.querySelectorAll('.sub-toggle-chk');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const alertMapImg = document.querySelector('.alert-map-img');
  const manageSubsBtn = document.getElementById('manageSubsBtn');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const alertsLangBtn = document.getElementById('alertsLangBtn');
  const alertsNotifBtn = document.getElementById('alertsNotifBtn');
  const userBadgePill = document.getElementById('userBadgePill');

  // Checkboxes
  const chkAllTypes = document.getElementById('chkAllTypes');
  const chkWarnings = document.getElementById('chkWarnings');
  const chkWatch = document.getElementById('chkWatch');
  const chkInfo = document.getElementById('chkInfo');
  const chkSevere = document.getElementById('chkSevere');
  const chkModerate = document.getElementById('chkModerate');
  const chkWatchSev = document.getElementById('chkWatchSev');
  const chkInfoSev = document.getElementById('chkInfoSev');

  // Mobile menu toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 1. Filter Tabs Clicking
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active-tab'));
      btn.classList.add('active-tab');
      const filter = btn.getAttribute('data-filter');
      applyTabFilter(filter);
    });
  });

  function applyTabFilter(filter) {
    alertCards.forEach(card => {
      const type = card.getAttribute('data-type');
      const severity = card.getAttribute('data-severity');

      if (filter === 'all' || filter === 'active') {
        card.style.display = 'flex';
      } else if (filter === 'warnings') {
        card.style.display = (type === 'warning') ? 'flex' : 'none';
      } else if (filter === 'watch') {
        card.style.display = (type === 'watch' || severity === 'watch') ? 'flex' : 'none';
      } else if (filter === 'info') {
        card.style.display = (type === 'info') ? 'flex' : 'none';
      }
    });
  }

  // 2. Alert Details Modal
  const alertAdvisories = {
    "Heavy Rainfall Warning": {
      title: "🚨 Heavy Rainfall Warning — Pune, Maharashtra",
      body: `
        <p><strong>Predicted Rainfall:</strong> 70mm to 115mm in 24 hours.</p>
        <p><strong>Impact Areas:</strong> Low-lying areas of Shivajinagar, Kothrud, Hadapsar, and Ghat sectors.</p>
        <p><strong>Safety Directives:</strong></p>
        <ul style="padding-left: 20px; margin-top: 4px;">
          <li>Avoid crossing flooded causeways and culverts.</li>
          <li>Ensure drainage pathways around residences are unclogged.</li>
          <li>Keep emergency numbers (112, 108) on speed dial.</li>
        </ul>
      `
    },
    "Strong Winds": {
      title: "⚠️ Strong Surface Winds Advisory — Mumbai",
      body: `
        <p><strong>Wind Speeds:</strong> Sustained gusty winds of 40-50 km/h with occasional peaks of 60 km/h along marine drive and coastal areas.</p>
        <p><strong>Precaution:</strong> Fishermen are advised not to venture into deep sea. Secure outdoor loose hoardings and construction scaffoldings.</p>
      `
    },
    "Heatwave Conditions": {
      title: "☀️ Heatwave Watch — Nagpur, Maharashtra",
      body: `
        <p><strong>Peak Temperatures:</strong> Maximum temperatures projected to reach 42°C – 44°C between 12:00 PM and 4:00 PM.</p>
        <p><strong>Hydration Advisory:</strong> Drink oral rehydration solutions (ORS) and avoid prolonged outdoor exertion during peak afternoon hours.</p>
      `
    }
  };

  viewAlertBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const alertName = btn.getAttribute('data-alert');
      const data = alertAdvisories[alertName] || {
        title: `${alertName} Details`,
        body: `<p>Real-time official advisory issued by India Meteorological Department (IMD).</p>`
      };

      if (modalAlertTitle) modalAlertTitle.innerHTML = data.title;
      if (modalAlertBody) modalAlertBody.innerHTML = data.body;
      if (alertModalOverlay) alertModalOverlay.style.display = 'flex';
    });
  });

  if (closeAlertModalBtn && alertModalOverlay) {
    closeAlertModalBtn.addEventListener('click', () => {
      alertModalOverlay.style.display = 'none';
    });
    alertModalOverlay.addEventListener('click', (e) => {
      if (e.target === alertModalOverlay) {
        alertModalOverlay.style.display = 'none';
      }
    });
  }

  // 3. Location & Checkbox Filter Controls
  locationFilterSelect?.addEventListener('change', () => {
    const city = locationFilterSelect.value;
    showToast(`Filtering alerts for: ${city}`, 'info');
  });

  clearFiltersBtn?.addEventListener('click', () => {
    // Reset checkboxes
    if (chkAllTypes) chkAllTypes.checked = true;
    if (chkWarnings) chkWarnings.checked = true;
    if (chkWatch) chkWatch.checked = true;
    if (chkInfo) chkInfo.checked = true;
    if (chkSevere) chkSevere.checked = true;
    if (chkModerate) chkModerate.checked = true;
    if (chkWatchSev) chkWatchSev.checked = true;
    if (chkInfoSev) chkInfoSev.checked = true;

    // Reset tabs
    tabBtns.forEach(b => b.classList.remove('active-tab'));
    tabBtns[0]?.classList.add('active-tab');

    // Show all cards
    alertCards.forEach(c => c.style.display = 'flex');

    showToast('Filters reset to default view.', 'success');
  });

  // 4. Alert Subscriptions Toggles
  subToggleChks.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const city = toggle.getAttribute('data-city') || 'City';
      const status = toggle.checked ? 'Enabled' : 'Disabled';
      showToast(`Push & Email alerts for ${city} ${status}`, toggle.checked ? 'success' : 'info');
    });
  });

  manageSubsBtn?.addEventListener('click', () => {
    showToast('Opening Notification & SMS Dispatch Preferences...', 'info');
  });

  // 5. Map Zoom Controls
  let zoomLevel = 1;
  if (zoomInBtn && alertMapImg) {
    zoomInBtn.addEventListener('click', () => {
      if (zoomLevel < 1.6) {
        zoomLevel += 0.2;
        alertMapImg.style.transform = `scale(${zoomLevel})`;
        alertMapImg.style.transition = 'transform 0.3s ease';
      }
    });
  }
  if (zoomOutBtn && alertMapImg) {
    zoomOutBtn.addEventListener('click', () => {
      if (zoomLevel > 1) {
        zoomLevel -= 0.2;
        alertMapImg.style.transform = `scale(${zoomLevel})`;
        alertMapImg.style.transition = 'transform 0.3s ease';
      }
    });
  }

  // 6. Header Actions
  alertsLangBtn?.addEventListener('click', () => {
    showToast('Languages supported: English, हिन्दी, मराठी, தமிழ், తెలుగు', 'info');
  });

  alertsNotifBtn?.addEventListener('click', () => {
    showToast('3 active high-priority IMD weather advisories.', 'info');
  });

  userBadgePill?.addEventListener('click', () => {
    showToast('Signed in as Sid Patil (sidpatil@gmail.com)', 'info');
  });

  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Receive instant WhatsApp & SMS storm alerts!', 'success');
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
