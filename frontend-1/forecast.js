/**
 * WeatherGPT Forecast Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme sync
  const htmlDoc = document.documentElement;
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  htmlDoc.setAttribute('data-theme', savedTheme);

  // DOM Elements
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const dayCards = document.querySelectorAll('.day-card');
  const chartTabBtns = document.querySelectorAll('.chart-tab-btn');
  const chartSvgContainer = document.getElementById('chartSvgContainer');
  const locationSearchInput = document.getElementById('locationSearchInput');
  const fLocItems = document.querySelectorAll('.f-loc-item');
  const starFavBtns = document.querySelectorAll('.star-fav-btn');
  const heroChangeLocBtn = document.getElementById('heroChangeLocBtn');
  const planUpgradeBtn = document.getElementById('planUpgradeBtn');
  const compareAddBtn = document.getElementById('compareAddBtn');
  const forecastLangBtn = document.getElementById('forecastLangBtn');
  const forecastNotifBtn = document.getElementById('forecastNotifBtn');
  const userBadgePill = document.getElementById('userBadgePill');
  const nextDayBtn = document.getElementById('nextDayBtn');
  const nextHourBtn = document.getElementById('nextHourBtn');
  const dayCardsContainer = document.getElementById('dayCardsContainer');
  const hourlyScrollGrid = document.getElementById('hourlyScrollGrid');

  // Mobile menu toggle
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // 1. 7-Day Cards Click Selection
  dayCards.forEach(card => {
    card.addEventListener('click', () => {
      dayCards.forEach(c => c.classList.remove('active-day-card'));
      card.classList.add('active-day-card');
      const day = card.getAttribute('data-day');
      showToast(`Viewing detailed forecast for ${day}`, 'info');
    });
  });

  // Carousel buttons
  if (nextDayBtn && dayCardsContainer) {
    nextDayBtn.addEventListener('click', () => {
      dayCardsContainer.scrollBy({ left: 120, behavior: 'smooth' });
    });
  }
  if (nextHourBtn && hourlyScrollGrid) {
    nextHourBtn.addEventListener('click', () => {
      hourlyScrollGrid.scrollBy({ left: 140, behavior: 'smooth' });
    });
  }

  // 2. Chart Sub-tabs Switching (Temperature, Precipitation, Wind, Humidity, Pressure)
  const chartDataConfigs = {
    "temperature": {
      title: "Warm with partly cloudy skies. Light winds throughout the day.",
      points: [
        { time: "6 AM", val: "23°", y: 115 },
        { time: "9 AM", val: "26°", y: 92 },
        { time: "12 PM", val: "28°", y: 76 },
        { time: "3 PM", val: "31°", y: 52 },
        { time: "6 PM", val: "29°", y: 68 },
        { time: "9 PM", val: "25°", y: 100 }
      ],
      max: "31°C at 3:00 PM",
      min: "22°C at 6:00 AM",
      rainfall: "2.4 mm",
      color: "#2563EB"
    },
    "precipitation": {
      title: "Scattered showers expected in the afternoon with moderate accumulation.",
      points: [
        { time: "6 AM", val: "10%", y: 130 },
        { time: "9 AM", val: "30%", y: 105 },
        { time: "12 PM", val: "60%", y: 70 },
        { time: "3 PM", val: "85%", y: 40 },
        { time: "6 PM", val: "70%", y: 60 },
        { time: "9 PM", val: "20%", y: 120 }
      ],
      max: "85% at 3:00 PM",
      min: "10% at 6:00 AM",
      rainfall: "14.2 mm",
      color: "#0284C7"
    },
    "wind": {
      title: "Gentle to moderate south-westerly breeze peaking around mid-day.",
      points: [
        { time: "6 AM", val: "8 km/h", y: 125 },
        { time: "9 AM", val: "12 km/h", y: 98 },
        { time: "12 PM", val: "16 km/h", y: 65 },
        { time: "3 PM", val: "19 km/h", y: 50 },
        { time: "6 PM", val: "14 km/h", y: 78 },
        { time: "9 PM", val: "9 km/h", y: 118 }
      ],
      max: "19 km/h at 3:00 PM",
      min: "8 km/h at 6:00 AM",
      rainfall: "2.4 mm",
      color: "#16A34A"
    },
    "humidity": {
      title: "Elevated atmospheric moisture with peak humidity during early morning.",
      points: [
        { time: "6 AM", val: "86%", y: 40 },
        { time: "9 AM", val: "75%", y: 65 },
        { time: "12 PM", val: "68%", y: 85 },
        { time: "3 PM", val: "62%", y: 105 },
        { time: "6 PM", val: "72%", y: 75 },
        { time: "9 PM", val: "82%", y: 50 }
      ],
      max: "86% at 6:00 AM",
      min: "62% at 3:00 PM",
      rainfall: "2.4 mm",
      color: "#9333EA"
    },
    "pressure": {
      title: "Barometric pressure steady across the regional Deccan plateau.",
      points: [
        { time: "6 AM", val: "1010 hPa", y: 50 },
        { time: "9 AM", val: "1009 hPa", y: 65 },
        { time: "12 PM", val: "1007 hPa", y: 95 },
        { time: "3 PM", val: "1006 hPa", y: 110 },
        { time: "6 PM", val: "1008 hPa", y: 80 },
        { time: "9 PM", val: "1010 hPa", y: 50 }
      ],
      max: "1010 hPa at 6:00 AM",
      min: "1006 hPa at 3:00 PM",
      rainfall: "2.4 mm",
      color: "#D97706"
    }
  };

  chartTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      chartTabBtns.forEach(b => b.classList.remove('active-chart-tab'));
      btn.classList.add('active-chart-tab');
      const chartType = btn.getAttribute('data-chart');
      renderChart(chartType);
    });
  });

  function renderChart(type) {
    const d = chartDataConfigs[type] || chartDataConfigs.temperature;
    
    // Update summary text
    const sumText = document.querySelector('.summary-box-text');
    if (sumText) sumText.textContent = d.title;

    // Render SVG
    if (!chartSvgContainer) return;
    const pts = d.points;
    const xCoords = [60, 140, 220, 310, 410, 500];
    
    let pathD = `M ${xCoords[0]} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      pathD += ` L ${xCoords[i]} ${pts[i].y}`;
    }

    const areaD = `${pathD} L ${xCoords[xCoords.length - 1]} 140 L ${xCoords[0]} 140 Z`;

    let pointsHTML = '';
    pts.forEach((p, i) => {
      pointsHTML += `
        <circle cx="${xCoords[i]}" cy="${p.y}" r="${i === 3 ? '5' : '4'}" fill="${d.color}"/>
        <text x="${xCoords[i] - 10}" y="${p.y - 11}" fill="#0F172A" font-size="11" font-weight="700">${p.val}</text>
        <text x="${xCoords[i] - 12}" y="162" fill="#64748B" font-size="11">${p.time}</text>
      `;
    });

    chartSvgContainer.innerHTML = `
      <svg viewBox="0 0 540 180" class="forecast-line-chart-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dynamicAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${d.color}" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="${d.color}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <!-- Grid Lines -->
        <line x1="40" y1="20" x2="520" y2="20" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="40" y1="60" x2="520" y2="60" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="40" y1="100" x2="520" y2="100" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="40" y1="140" x2="520" y2="140" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3 3"/>

        <path d="${areaD}" fill="url(#dynamicAreaGrad)"/>
        <path d="${pathD}" fill="none" stroke="${d.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        ${pointsHTML}
      </svg>
    `;
  }

  // 3. Location Search Filter in Widget
  locationSearchInput?.addEventListener('input', () => {
    const query = locationSearchInput.value.toLowerCase().trim();
    fLocItems.forEach(item => {
      const city = item.getAttribute('data-city').toLowerCase();
      item.style.display = city.includes(query) ? 'flex' : 'none';
    });
  });

  fLocItems.forEach(item => {
    item.addEventListener('click', () => {
      fLocItems.forEach(i => i.classList.remove('active-f-loc'));
      item.classList.add('active-f-loc');
      const city = item.getAttribute('data-city');
      const currentCityHeader = document.querySelector('.current-city-header');
      if (currentCityHeader) currentCityHeader.textContent = city;
      showToast(`Switched forecast location to ${city}`, 'success');
    });
  });

  // Star favorites toggle
  starFavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.classList.toggle('favorited');
      const isFav = btn.classList.contains('favorited');
      showToast(isFav ? 'Added to favorites ⭐' : 'Removed from favorites', 'info');
    });
  });

  // Hero change location
  heroChangeLocBtn?.addEventListener('click', () => {
    const newCity = prompt('Enter city for 7-day weather forecast:', 'Bengaluru, Karnataka');
    if (newCity && newCity.trim()) {
      const currentCityHeader = document.querySelector('.current-city-header');
      if (currentCityHeader) currentCityHeader.textContent = newCity;
      showToast(`Updated location to ${newCity}`, 'success');
    }
  });

  // Upgrade buttons
  planUpgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Access 14-day hyper-local forecasts!', 'success');
  });

  // Compare locations
  compareAddBtn?.addEventListener('click', () => {
    const compCity = prompt('Enter secondary location to compare:', 'Mumbai, Maharashtra');
    if (compCity && compCity.trim()) {
      showToast(`Comparing Pune with ${compCity} ⚖️`, 'info');
    }
  });

  // Header actions
  forecastLangBtn?.addEventListener('click', () => {
    showToast('Forecast available in English, Hindi, Marathi, Spanish, German.', 'info');
  });
  forecastNotifBtn?.addEventListener('click', () => {
    showToast('Tomorrow 3:00 PM: Moderate rain expected.', 'info');
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
