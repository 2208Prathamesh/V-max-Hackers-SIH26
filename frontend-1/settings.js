/**
 * WeatherGPT Settings Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const setNavBtns = document.querySelectorAll('.set-nav-btn');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const changePasswordBtn = document.getElementById('changePasswordBtn');
  const deleteAccountBtn = document.getElementById('deleteAccountBtn');
  const tempUnitSelect = document.getElementById('tempUnitSelect');
  const windUnitSelect = document.getElementById('windUnitSelect');
  const pressureUnitSelect = document.getElementById('pressureUnitSelect');
  const precipUnitSelect = document.getElementById('precipUnitSelect');
  const timezoneSelect = document.getElementById('timezoneSelect');
  const prefToggleChks = document.querySelectorAll('.pref-toggle-chk');
  const settingsLangBtn = document.getElementById('settingsLangBtn');
  const settingsNotifBtn = document.getElementById('settingsNotifBtn');
  const userBadgePill = document.getElementById('userBadgePill');
  const upgradeBtn = document.getElementById('upgradeBtn');

  // Mobile menu toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 1. Settings Sub-nav Tabs
  setNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setNavBtns.forEach(b => b.classList.remove('active-set-tab'));
      btn.classList.add('active-set-tab');
      const tab = btn.getAttribute('data-tab');

      if (tab === 'general') {
        document.getElementById('cardGeneral')?.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'units') {
        document.getElementById('cardUnits')?.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'notifications') {
        document.getElementById('cardNotifications')?.scrollIntoView({ behavior: 'smooth' });
      } else if (tab === 'appearance') {
        const current = htmlDoc.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        htmlDoc.setAttribute('data-theme', next);
        localStorage.setItem('weathergpt_theme', next);
        showToast(`Theme switched to ${next.toUpperCase()} mode! 🌓`, 'success');
      } else {
        showToast(`Navigated to ${btn.innerText.trim()} settings.`, 'info');
      }
    });
  });

  // 2. Profile Edit
  editProfileBtn?.addEventListener('click', () => {
    const newName = prompt('Enter your name:', 'Sid Patil');
    if (newName && newName.trim()) {
      document.querySelectorAll('.account-name, .user-name').forEach(el => el.textContent = newName.trim());
      showToast(`Profile name updated to ${newName.trim()}`, 'success');
    }
  });

  // 3. Change Password
  changePasswordBtn?.addEventListener('click', () => {
    const currentPass = prompt('Enter your current password:');
    if (currentPass) {
      const newPass = prompt('Enter your new password:');
      if (newPass && newPass.length >= 6) {
        showToast('Password changed successfully! 🔒', 'success');
      } else {
        showToast('Password must be at least 6 characters.', 'error');
      }
    }
  });

  // 4. Units & Format Selectors
  tempUnitSelect?.addEventListener('change', () => {
    localStorage.setItem('weathergpt_unit_temp', tempUnitSelect.value);
    showToast(`Temperature unit set to ${tempUnitSelect.options[tempUnitSelect.selectedIndex].text}`, 'info');
  });

  windUnitSelect?.addEventListener('change', () => {
    localStorage.setItem('weathergpt_unit_wind', windUnitSelect.value);
    showToast(`Wind unit set to ${windUnitSelect.value}`, 'info');
  });

  pressureUnitSelect?.addEventListener('change', () => {
    localStorage.setItem('weathergpt_unit_pressure', pressureUnitSelect.value);
    showToast(`Pressure unit set to ${pressureUnitSelect.value}`, 'info');
  });

  precipUnitSelect?.addEventListener('change', () => {
    localStorage.setItem('weathergpt_unit_precip', precipUnitSelect.value);
    showToast(`Precipitation unit set to ${precipUnitSelect.value}`, 'info');
  });

  timezoneSelect?.addEventListener('change', () => {
    showToast(`Timezone updated to ${timezoneSelect.value}`, 'info');
  });

  // 5. Notification Preferences Toggles
  prefToggleChks.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const pref = toggle.getAttribute('data-pref');
      const status = toggle.checked ? 'Enabled' : 'Disabled';
      showToast(`${pref} notifications ${status}`, toggle.checked ? 'success' : 'info');
    });
  });

  // 6. Delete Account (Danger Zone)
  deleteAccountBtn?.addEventListener('click', () => {
    const confirmDelete = confirm('Are you sure you want to permanently delete your WeatherGPT account and history? This cannot be undone.');
    if (confirmDelete) {
      localStorage.clear();
      showToast('Account data cleared. Redirecting to login...', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });

  // 7. Header buttons
  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Access ultra-high resolution satellite radar & unlimited alerts!', 'success');
  });

  settingsLangBtn?.addEventListener('click', () => {
    showToast('Language: English (US)', 'info');
  });

  settingsNotifBtn?.addEventListener('click', () => {
    showToast('All your preferences are safely backed up.', 'info');
  });

  userBadgePill?.addEventListener('click', () => {
    showToast('Signed in as Sid Patil (sidpatil@gmail.com)', 'info');
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
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
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
