/**
 * WeatherGPT Weather Map Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const themeMoonBtn = document.getElementById('themeMoonBtn');
  const mapSubtabs = document.querySelectorAll('.map-tab-btn');
  const cityPins = document.querySelectorAll('.city-marker-pill');
  const quickLocItems = document.querySelectorAll('.quick-loc-item');
  const satelliteImg = document.getElementById('satelliteImg');
  const mapZoomIn = document.getElementById('mapZoomIn');
  const mapZoomOut = document.getElementById('mapZoomOut');
  const mapTargetLoc = document.getElementById('mapTargetLoc');
  const mapLayersBtn = document.getElementById('mapLayersBtn');
  const mapFullscreenBtn = document.getElementById('mapFullscreenBtn');
  const myLocBtn = document.getElementById('myLocBtn');
  const timelinePlayBtn = document.getElementById('timelinePlayBtn');
  const playSvg = timelinePlayBtn?.querySelector('.play-svg');
  const pauseSvg = timelinePlayBtn?.querySelector('.pause-svg');
  const scrubProgressFill = document.querySelector('.scrub-progress-fill');
  const scrubActiveDot = document.querySelector('.scrub-active-dot');
  const scrubTrackLine = document.querySelector('.scrub-track-line');
  const starFavBtn = document.getElementById('starFavBtn');
  const mapLangBtn = document.getElementById('mapLangBtn');
  const mapNotifBtn = document.getElementById('mapNotifBtn');
  const userBadgePill = document.getElementById('userBadgePill');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const inspectorRefreshBtn = document.getElementById('inspectorRefreshBtn');
  const timelineRefreshBtn = document.getElementById('timelineRefreshBtn');
  const layerCheckboxes = document.querySelectorAll('.layer-chk-item');

  // Selected Location Elements
  const inspectorCityTitle = document.getElementById('inspectorCityTitle');
  const inspectorMainTemp = document.getElementById('inspectorMainTemp');
  const inspectorConditionTxt = document.getElementById('inspectorConditionTxt');
  const inspectorFeelsLike = document.getElementById('inspectorFeelsLike');
  const inspectorHumidity = document.getElementById('inspectorHumidity');
  const inspectorWind = document.getElementById('inspectorWind');
  const inspectorPressure = document.getElementById('inspectorPressure');

  // Mobile menu toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 1. Theme Toggle (Moon button)
  themeMoonBtn?.addEventListener('click', () => {
    const current = htmlDoc.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlDoc.setAttribute('data-theme', next);
    localStorage.setItem('weathergpt_theme', next);
    showToast(`Switched to ${next.toUpperCase()} mode! 🌓`, 'info');
  });

  // 2. City Weather Database
  const cityData = {
    'Pune': {
      title: 'Pune, Maharashtra',
      temp: '27°C',
      condition: 'Partly Cloudy',
      feels: '30°C',
      humidity: '72%',
      wind: '16 km/h SW',
      pressure: '1008 hPa'
    },
    'Mumbai': {
      title: 'Mumbai, Maharashtra',
      temp: '28°C',
      condition: 'Light Rain',
      feels: '31°C',
      humidity: '80%',
      wind: '20 km/h W',
      pressure: '1006 hPa'
    },
    'New Delhi': {
      title: 'New Delhi, Delhi',
      temp: '32°C',
      condition: 'Sunny & Clear',
      feels: '34°C',
      humidity: '45%',
      wind: '12 km/h N',
      pressure: '1014 hPa'
    },
    'Jaipur': {
      title: 'Jaipur, Rajasthan',
      temp: '31°C',
      condition: 'Clear Sky',
      feels: '33°C',
      humidity: '35%',
      wind: '14 km/h W',
      pressure: '1011 hPa'
    },
    'Lucknow': {
      title: 'Lucknow, Uttar Pradesh',
      temp: '33°C',
      condition: 'Hazy Sun',
      feels: '36°C',
      humidity: '52%',
      wind: '8 km/h E',
      pressure: '1012 hPa'
    },
    'Kolkata': {
      title: 'Kolkata, West Bengal',
      temp: '30°C',
      condition: 'Scattered Showers',
      feels: '35°C',
      humidity: '78%',
      wind: '15 km/h SE',
      pressure: '1007 hPa'
    },
    'Hyderabad': {
      title: 'Hyderabad, Telangana',
      temp: '29°C',
      condition: 'Overcast',
      feels: '31°C',
      humidity: '68%',
      wind: '14 km/h S',
      pressure: '1010 hPa'
    },
    'Bengaluru': {
      title: 'Bengaluru, Karnataka',
      temp: '25°C',
      condition: 'Cloudy',
      feels: '26°C',
      humidity: '65%',
      wind: '10 km/h NE',
      pressure: '1013 hPa'
    },
    'Chennai': {
      title: 'Chennai, Tamil Nadu',
      temp: '30°C',
      condition: 'Humid & Partly Sunny',
      feels: '35°C',
      humidity: '75%',
      wind: '18 km/h E',
      pressure: '1009 hPa'
    },
    'Srinagar': {
      title: 'Srinagar, Jammu & Kashmir',
      temp: '22°C',
      condition: 'Pleasant & Clear',
      feels: '22°C',
      humidity: '40%',
      wind: '6 km/h NW',
      pressure: '1016 hPa'
    }
  };

  function selectCity(cityName) {
    const data = cityData[cityName];
    if (!data) return;

    if (inspectorCityTitle) inspectorCityTitle.textContent = data.title;
    if (inspectorMainTemp) inspectorMainTemp.textContent = data.temp;
    if (inspectorConditionTxt) inspectorConditionTxt.textContent = data.condition;
    if (inspectorFeelsLike) inspectorFeelsLike.textContent = data.feels;
    if (inspectorHumidity) inspectorHumidity.textContent = data.humidity;
    if (inspectorWind) inspectorWind.textContent = data.wind;
    if (inspectorPressure) inspectorPressure.textContent = data.pressure;

    // Update pins active state
    cityPins.forEach(p => {
      if (p.getAttribute('data-city') === cityName) {
        p.classList.add('active-selected-pin');
      } else {
        p.classList.remove('active-selected-pin');
      }
    });

    // Update quick locations active state
    quickLocItems.forEach(q => {
      if (q.getAttribute('data-city') === cityName) {
        q.classList.add('active-qloc');
      } else {
        q.classList.remove('active-qloc');
      }
    });

    showToast(`Loaded live observations for ${cityName} 📍`, 'info');
  }

  cityPins.forEach(pin => {
    pin.addEventListener('click', () => {
      const city = pin.getAttribute('data-city');
      selectCity(city);
    });
  });

  quickLocItems.forEach(item => {
    item.addEventListener('click', () => {
      const city = item.getAttribute('data-city');
      selectCity(city);
    });
  });

  // 3. Sub-tabs Bar
  mapSubtabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mapSubtabs.forEach(t => t.classList.remove('active-tab'));
      tab.classList.add('active-tab');
      const layer = tab.getAttribute('data-layer');
      showToast(`Switched map view to ${tab.textContent.trim()}`, 'info');
    });
  });

  // 4. Star Favorite Toggle
  let isStarred = true;
  starFavBtn?.addEventListener('click', () => {
    isStarred = !isStarred;
    const svg = starFavBtn.querySelector('svg');
    if (isStarred) {
      svg.style.fill = '#F59E0B';
      svg.style.stroke = '#F59E0B';
      showToast('Location pinned to your favorites ⭐', 'success');
    } else {
      svg.style.fill = 'none';
      svg.style.stroke = '#94A3B8';
      showToast('Removed from favorites', 'info');
    }
  });

  // 5. Timeline Play/Pause Slider Loop
  let isPlaying = false;
  let playTimer = null;
  let progress = 40;

  timelinePlayBtn?.addEventListener('click', () => {
    isPlaying = !isPlaying;
    if (isPlaying) {
      playSvg.style.display = 'none';
      pauseSvg.style.display = 'block';
      showToast('Playing Doppler rainfall loop...', 'info');

      playTimer = setInterval(() => {
        progress += 5;
        if (progress > 100) progress = 0;
        if (scrubProgressFill) scrubProgressFill.style.width = `${progress}%`;
        if (scrubActiveDot) scrubActiveDot.style.left = `${progress}%`;
      }, 250);
    } else {
      playSvg.style.display = 'block';
      pauseSvg.style.display = 'none';
      clearInterval(playTimer);
      showToast('Timeline paused', 'info');
    }
  });

  // 6. Scrub Track Click
  scrubTrackLine?.addEventListener('click', (e) => {
    const rect = scrubTrackLine.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    progress = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    if (scrubProgressFill) scrubProgressFill.style.width = `${progress}%`;
    if (scrubActiveDot) scrubActiveDot.style.left = `${progress}%`;
  });

  // 7. Zoom Controls
  let zoomLevel = 1;
  mapZoomIn?.addEventListener('click', () => {
    zoomLevel = Math.min(zoomLevel + 0.25, 2.5);
    satelliteImg.style.transform = `scale(${zoomLevel})`;
    showToast(`Zoom: ${Math.round(zoomLevel * 100)}%`, 'info');
  });

  mapZoomOut?.addEventListener('click', () => {
    zoomLevel = Math.max(zoomLevel - 0.25, 1);
    satelliteImg.style.transform = `scale(${zoomLevel})`;
    showToast(`Zoom: ${Math.round(zoomLevel * 100)}%`, 'info');
  });

  mapTargetLoc?.addEventListener('click', () => {
    zoomLevel = 1.3;
    satelliteImg.style.transform = `scale(${zoomLevel})`;
    selectCity('Pune');
  });

  myLocBtn?.addEventListener('click', () => {
    zoomLevel = 1.3;
    satelliteImg.style.transform = `scale(${zoomLevel})`;
    selectCity('Pune');
  });

  mapFullscreenBtn?.addEventListener('click', () => {
    const screen = document.getElementById('satelliteMapScreen');
    if (!document.fullscreenElement) {
      screen?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });

  // 8. Refresh Buttons
  inspectorRefreshBtn?.addEventListener('click', () => {
    showToast('Updated observations with IMD radar telemetry 🔄', 'success');
  });

  timelineRefreshBtn?.addEventListener('click', () => {
    showToast('Radar telemetry synced (10:20 AM) 🔄', 'success');
  });

  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Access 10-minute HD radar loops & storm tracks!', 'success');
  });

  mapLangBtn?.addEventListener('click', () => {
    showToast('Language: English (US)', 'info');
  });

  mapNotifBtn?.addEventListener('click', () => {
    showToast('Radar feed operational. 1 Active severe weather advisory in Maharashtra.', 'info');
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
