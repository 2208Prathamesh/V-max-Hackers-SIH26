/**
 * WeatherGPT Saved Locations Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const savedSortSelect = document.getElementById('savedSortSelect');
  const savedCardsContainer = document.getElementById('savedCardsContainer');
  const headerAddLocBtn = document.getElementById('headerAddLocBtn');
  const bottomAddNewLocCard = document.getElementById('bottomAddNewLocCard');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');
  const savedLangBtn = document.getElementById('savedLangBtn');
  const savedNotifBtn = document.getElementById('savedNotifBtn');
  const userBadgePill = document.getElementById('userBadgePill');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const viewFullMapLink = document.getElementById('viewFullMapLink');
  const viewDetailedSumLink = document.getElementById('viewDetailedSumLink');
  const viewAllTipsLink = document.getElementById('viewAllTipsLink');

  // Mobile menu toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 1. View Mode Toggles (List vs Grid)
  viewGridBtn?.addEventListener('click', () => {
    viewGridBtn.classList.add('active-toggle');
    viewListBtn.classList.remove('active-toggle');
    savedCardsContainer.style.display = 'grid';
    savedCardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
    showToast('Switched to Grid view', 'info');
  });

  viewListBtn?.addEventListener('click', () => {
    viewListBtn.classList.add('active-toggle');
    viewGridBtn.classList.remove('active-toggle');
    savedCardsContainer.style.display = 'flex';
    savedCardsContainer.style.flexDirection = 'column';
    showToast('Switched to List view', 'info');
  });

  // 2. Sorting Saved Locations
  savedSortSelect?.addEventListener('change', () => {
    const val = savedSortSelect.value;
    const cards = Array.from(savedCardsContainer.querySelectorAll('.saved-loc-card'));

    if (val === 'name') {
      cards.sort((a, b) => a.getAttribute('data-city').localeCompare(b.getAttribute('data-city')));
    } else if (val === 'temp-high') {
      cards.sort((a, b) => parseInt(b.getAttribute('data-temp')) - parseInt(a.getAttribute('data-temp')));
    } else if (val === 'temp-low') {
      cards.sort((a, b) => parseInt(a.getAttribute('data-temp')) - parseInt(b.getAttribute('data-temp')));
    }

    cards.forEach(card => savedCardsContainer.appendChild(card));
    showToast(`Locations sorted by: ${savedSortSelect.options[savedSortSelect.selectedIndex].text}`, 'info');
  });

  // 3. Card click & Three dots options
  attachCardEvents();

  function attachCardEvents() {
    const cards = document.querySelectorAll('.saved-loc-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.loc-options-btn')) return;
        const city = card.getAttribute('data-city');
        showToast(`Loading weather dashboard for ${city}...`, 'info');
        setTimeout(() => {
          window.location.href = `forecast.html?city=${encodeURIComponent(city)}`;
        }, 500);
      });

      const optBtn = card.querySelector('.loc-options-btn');
      optBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        const city = card.getAttribute('data-city');
        const choice = confirm(`Options for ${city}:\n\n- Click OK to set as Primary Location\n- Click Cancel to close.`);
        if (choice) {
          showToast(`${city} set as your primary location 📍`, 'success');
        }
      });
    });
  }

  // 4. Add New Location
  function promptAddLocation() {
    const newCity = prompt('Enter city and state to save (e.g. Hyderabad, Telangana):');
    if (newCity && newCity.trim()) {
      const card = document.createElement('article');
      card.className = 'saved-loc-card';
      card.setAttribute('data-city', newCity.split(',')[0].trim());
      card.setAttribute('data-temp', '29');

      card.innerHTML = `
        <div class="card-cell city-meta-cell">
          <div class="city-title-row">
            <span class="blue-bullet-dot"></span>
            <h3 class="city-name-txt">${newCity.trim()}</h3>
          </div>
          <span class="country-txt">India</span>
          <span class="last-updated-txt">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Just now
          </span>
        </div>

        <div class="card-cell temp-art-cell">
          <div class="cell-art-box">
            <svg viewBox="0 0 36 36" class="loc-weather-svg"><circle cx="22" cy="14" r="7" fill="#F59E0B"/><path d="M11 26h18a6 6 0 0 0 0-12 7.5 7.5 0 0 0-14.4 2.7A5.25 5.25 0 0 0 11 26z" fill="#93C5FD"/></svg>
          </div>
          <div class="cell-temp-group">
            <span class="loc-big-temp">29<span class="deg-sym">°C</span></span>
            <span class="loc-condition-txt">Partly Sunny</span>
          </div>
        </div>

        <div class="card-cell metrics-summary-cell">
          <div class="loc-metric-line"><span class="l-lbl">Feels like</span><span class="l-val">31°C</span></div>
          <div class="loc-metric-line"><span class="l-lbl">Humidity</span><span class="l-val">58%</span></div>
          <div class="loc-metric-line"><span class="l-lbl">Wind</span><span class="l-val">12 km/h E</span></div>
        </div>

        <div class="card-cell mini-forecast-cell">
          <div class="mini-day-col"><span class="m-day">Wed</span><svg viewBox="0 0 24 24" class="m-icon"><circle cx="12" cy="12" r="5" fill="#F59E0B"/></svg><span class="m-temp">30°</span></div>
          <div class="mini-day-col"><span class="m-day">Thu</span><svg viewBox="0 0 24 24" class="m-icon"><circle cx="12" cy="12" r="5" fill="#F59E0B"/></svg><span class="m-temp">31°</span></div>
          <div class="mini-day-col"><span class="m-day">Fri</span><svg viewBox="0 0 24 24" class="m-icon"><circle cx="12" cy="12" r="5" fill="#F59E0B"/></svg><span class="m-temp">31°</span></div>
        </div>

        <div class="card-cell action-menu-cell">
          <button type="button" class="loc-options-btn" aria-label="Location options">⋮</button>
        </div>
      `;

      savedCardsContainer.appendChild(card);
      attachCardEvents();

      const counter = document.querySelector('.locations-counter');
      if (counter) {
        const total = document.querySelectorAll('.saved-loc-card').length;
        counter.textContent = `(${total})`;
      }

      showToast(`Added ${newCity.trim()} to your saved locations!`, 'success');
    }
  }

  headerAddLocBtn?.addEventListener('click', promptAddLocation);
  bottomAddNewLocCard?.addEventListener('click', promptAddLocation);

  // 5. Upgrade & Links
  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Unlimited saved locations across 190+ countries!', 'success');
  });

  savedLangBtn?.addEventListener('click', () => {
    showToast('Language: English (US)', 'info');
  });

  savedNotifBtn?.addEventListener('click', () => {
    showToast('All saved locations synced in real-time.', 'info');
  });

  userBadgePill?.addEventListener('click', () => {
    showToast('Signed in as Sid Patil (sidpatil@gmail.com)', 'info');
  });

  viewFullMapLink?.addEventListener('click', () => {
    showToast('Opening full-screen national weather radar...', 'info');
  });

  viewDetailedSumLink?.addEventListener('click', () => {
    showToast('Viewing comparative analytical report.', 'info');
  });

  viewAllTipsLink?.addEventListener('click', () => {
    showToast('Viewing personalized climate recommendations.', 'info');
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
