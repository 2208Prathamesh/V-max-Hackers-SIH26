/**
 * WeatherGPT Dashboard Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const htmlDoc = document.documentElement;
  const themeToggle = document.getElementById('themeToggleCheckbox');
  const themeModeLabel = document.getElementById('themeModeLabel');
  const aiPromptForm = document.getElementById('aiPromptForm');
  const promptInput = document.getElementById('promptInput');
  const voicePromptBtn = document.getElementById('voicePromptBtn');
  const quickPills = document.querySelectorAll('.quick-pill');
  const aiModalOverlay = document.getElementById('aiModalOverlay');
  const closeAiModalBtn = document.getElementById('closeAiModalBtn');
  const modalUserQuery = document.getElementById('modalUserQuery');
  const modalAiResponse = document.getElementById('modalAiResponse');
  const viewAlertDetailsBtn = document.getElementById('viewAlertDetailsBtn');
  const savedLocItems = document.querySelectorAll('.saved-loc-item');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const appSidebar = document.getElementById('appSidebar');
  const navLinks = document.querySelectorAll('.nav-link');
  const notificationBtn = document.getElementById('notificationBtn');
  const langSelectorBtn = document.getElementById('langSelectorBtn');
  const userProfileBtn = document.getElementById('userProfileBtn');
  const changeLocationBtn = document.getElementById('changeLocationBtn');
  const currentLocationText = document.getElementById('currentLocationText');

  // Hero Card Elements
  const heroCityTitle = document.querySelector('.hero-city-title');
  const heroTemperature = document.querySelector('.hero-temperature');
  const heroFeelsLike = document.querySelector('.hero-feels-like');
  const heroConditionText = document.querySelector('.hero-condition-text');

  // Quick Action Buttons
  const qaForecastBtn = document.getElementById('qaForecastBtn');
  const qaMapBtn = document.getElementById('qaMapBtn');
  const qaAlertsBtn = document.getElementById('qaAlertsBtn');
  const qaAqiBtn = document.getElementById('qaAqiBtn');

  // 1. Theme Toggle (Light / Dark Mode)
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('weathergpt_theme', newTheme);
      showToast(`Switched to ${newTheme === 'light' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}`, 'info');
    });
  }

  function applyTheme(theme) {
    htmlDoc.setAttribute('data-theme', theme);
    if (themeToggle) themeToggle.checked = (theme === 'light');
    if (themeModeLabel) {
      themeModeLabel.textContent = theme === 'light' ? 'Light Mode' : 'Dark Mode';
    }
  }

  // 2. Navigation Active State
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.endsWith('.html')) {
        return; // Allow natural page transition
      }
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const targetName = link.querySelector('span')?.textContent || 'Section';
      showToast(`Navigated to ${targetName}`, 'info');
    });
  });

  // 3. Mobile Menu Toggle
  if (mobileMenuBtn && appSidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 4. AI Weather Assistant Knowledge Base
  const aiResponses = {
    "will it rain tomorrow": "Based on current meteorological Doppler radar for Pune & Western Maharashtra, there is an **85% chance of moderate to heavy showers** tomorrow afternoon starting around 1:30 PM. Keep an umbrella handy! ☔",
    "weather in mumbai": "Mumbai is currently experiencing **29°C** with humid coastal breezes (78% humidity). Moderate rain showers are expected along the coastline today with winds up to 24 km/h.",
    "cyclone update": "Current satellite tracking indicates a deep depression in the North Bay of Bengal moving NW at 14 km/h. Coastal Maharashtra remains unaffected, but heavy rainfall warnings are issued for coastal Odisha and West Bengal.",
    "air quality today": "Air Quality Index (AQI) for Pune is currently **48 (Good)**, primarily due to recent wind dispersion. Delhi AQI is **142 (Moderate)**."
  };

  const askWeatherAI = (query) => {
    if (!query.trim()) return;
    const cleanQ = query.toLowerCase().trim();
    modalUserQuery.textContent = query;
    modalAiResponse.innerHTML = `
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
    aiModalOverlay.style.display = 'flex';

    // Find best match response or generate dynamic answer
    let responseText = "Here's the latest satellite meteorological forecast: Weather conditions are stable with partly cloudy skies, moderate humidity, and low precipitation index for the selected region.";
    for (const key in aiResponses) {
      if (cleanQ.includes(key)) {
        responseText = aiResponses[key];
        break;
      }
    }

    setTimeout(() => {
      modalAiResponse.innerHTML = `<p>${responseText}</p>`;
    }, 800);
  };

  // 5. AI Prompt Submission
  if (aiPromptForm && promptInput) {
    aiPromptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = promptInput.value.trim();
      if (val) {
        askWeatherAI(val);
        promptInput.value = '';
      }
    });
  }

  // Quick suggestion pills
  quickPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const text = pill.textContent.trim();
      if (promptInput) promptInput.value = text;
      askWeatherAI(text);
    });
  });

  // Close AI modal
  if (closeAiModalBtn && aiModalOverlay) {
    closeAiModalBtn.addEventListener('click', () => {
      aiModalOverlay.style.display = 'none';
    });
    aiModalOverlay.addEventListener('click', (e) => {
      if (e.target === aiModalOverlay) {
        aiModalOverlay.style.display = 'none';
      }
    });
  }

  // 6. Voice Input Simulation
  if (voicePromptBtn) {
    voicePromptBtn.addEventListener('click', () => {
      voicePromptBtn.style.transform = 'scale(1.2)';
      voicePromptBtn.style.color = '#ef4444';
      showToast('Listening to your weather question... 🎙️', 'info');
      setTimeout(() => {
        voicePromptBtn.style.transform = 'scale(1)';
        voicePromptBtn.style.color = '';
        if (promptInput) promptInput.value = 'Will it rain tomorrow in Pune?';
        askWeatherAI('Will it rain tomorrow in Pune?');
      }, 1500);
    });
  }

  // 7. Interactive Saved Locations Switcher
  const cityData = {
    "Pune, Maharashtra": { temp: "28°C", feels: "Feels like 30°C", cond: "Partly Cloudy", humidity: "72%", wind: "14 km/h" },
    "Mumbai, Maharashtra": { temp: "29°C", feels: "Feels like 33°C", cond: "Rain Showers", humidity: "82%", wind: "22 km/h" },
    "Nagpur, Maharashtra": { temp: "32°C", feels: "Feels like 35°C", cond: "Sunny & Clear", humidity: "45%", wind: "9 km/h" },
    "Delhi, India": { temp: "34°C", feels: "Feels like 38°C", cond: "Sunny & Warm", humidity: "38%", wind: "11 km/h" }
  };

  savedLocItems.forEach(item => {
    item.addEventListener('click', () => {
      const city = item.getAttribute('data-city');
      if (city && cityData[city]) {
        savedLocItems.forEach(i => i.classList.remove('active-loc'));
        item.classList.add('active-loc');

        const d = cityData[city];
        if (heroCityTitle) heroCityTitle.textContent = city;
        if (heroTemperature) heroTemperature.innerHTML = `${d.temp.replace('°C', '')}<span class="temp-unit">°C</span>`;
        if (heroFeelsLike) heroFeelsLike.textContent = d.feels;
        if (heroConditionText) heroConditionText.textContent = d.cond;
        if (currentLocationText) currentLocationText.textContent = city;

        showToast(`Loaded live weather for ${city}`, 'success');
      }
    });
  });

  // Change location action
  if (changeLocationBtn) {
    changeLocationBtn.addEventListener('click', () => {
      const newCity = prompt('Enter city name (e.g. Bengaluru, Hyderabad, Chennai):', 'Bengaluru, Karnataka');
      if (newCity && newCity.trim()) {
        if (heroCityTitle) heroCityTitle.textContent = newCity;
        if (currentLocationText) currentLocationText.textContent = newCity;
        showToast(`Location updated to ${newCity}`, 'success');
      }
    });
  }

  // 8. View Alert Details Button
  if (viewAlertDetailsBtn) {
    viewAlertDetailsBtn.addEventListener('click', () => {
      askWeatherAI('Explain the Heavy Rainfall Warning for Pune in detail');
    });
  }

  // 9. Quick Action Button Handlers
  if (qaForecastBtn) {
    qaForecastBtn.addEventListener('click', () => {
      askWeatherAI('Give me 7-day extended weather forecast for Pune');
    });
  }
  if (qaMapBtn) {
    qaMapBtn.addEventListener('click', () => {
      showToast('Opening live interactive radar weather map...', 'info');
    });
  }
  if (qaAlertsBtn) {
    qaAlertsBtn.addEventListener('click', () => {
      showToast('3 Active Meteorological Alerts in your state.', 'error');
    });
  }
  if (qaAqiBtn) {
    qaAqiBtn.addEventListener('click', () => {
      askWeatherAI('Detailed Air Quality Index and pollutant report for Pune');
    });
  }

  // 10. Top Bar Actions
  notificationBtn?.addEventListener('click', () => {
    showToast('Notifications: 1. Heavy rain alert, 2. Air quality update, 3. Cyclone advisory.', 'info');
  });

  langSelectorBtn?.addEventListener('click', () => {
    showToast('Languages supported: English, Hindi, Marathi, Spanish, French.', 'info');
  });

  userProfileBtn?.addEventListener('click', () => {
    showToast('Logged in as Sid (sid@weathergpt.ai)', 'info');
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
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }
});
