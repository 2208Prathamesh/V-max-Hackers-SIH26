/**
 * WeatherGPT Chat Tab Interactivity & Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Theme management
  const htmlDoc = document.documentElement;
  const chatThemeToggleBtn = document.getElementById('chatThemeToggleBtn');
  const savedTheme = localStorage.getItem('weathergpt_theme') || 'light';
  applyTheme(savedTheme);

  if (chatThemeToggleBtn) {
    chatThemeToggleBtn.addEventListener('click', () => {
      const current = htmlDoc.getAttribute('data-theme') || 'light';
      const newTheme = current === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('weathergpt_theme', newTheme);
      showToast(`Switched to ${newTheme === 'light' ? 'Light Mode ☀️' : 'Dark Mode 🌙'}`, 'info');
    });
  }

  function applyTheme(theme) {
    htmlDoc.setAttribute('data-theme', theme);
  }

  // DOM Elements
  const chatForm = document.getElementById('chatForm');
  const chatMessageInput = document.getElementById('chatMessageInput');
  const chatMessagesContainer = document.getElementById('chatMessagesContainer');
  const chatMicBtn = document.getElementById('chatMicBtn');
  const chatAttachBtn = document.getElementById('chatAttachBtn');
  const mobileMenuToggle = document.getElementById('mobileMenuToggle');
  const appSidebar = document.getElementById('appSidebar');
  const recentItems = document.querySelectorAll('.recent-item');
  const cwRefreshBtn = document.getElementById('cwRefreshBtn');
  const cwUpdatedText = document.querySelector('.cw-updated');
  const upgradeBtn = document.getElementById('upgradeBtn');
  const chatLangBtn = document.getElementById('chatLangBtn');
  const addLocationBtn = document.getElementById('addLocationBtn');
  const wSavedItems = document.querySelectorAll('.w-saved-item');

  // Mobile menu
  if (mobileMenuToggle && appSidebar) {
    mobileMenuToggle.addEventListener('click', () => {
      appSidebar.classList.toggle('sidebar-open');
    });
  }

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (chatMessagesContainer) {
      chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
    }
  };
  scrollToBottom();

  // Reaction buttons & Copy handler
  function attachReactionHandlers(container = document) {
    const copyBtns = container.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const bubbleText = btn.closest('.ai-bubble-container')?.querySelector('.ai-bubble')?.innerText || '';
        navigator.clipboard.writeText(bubbleText).then(() => {
          showToast('Copied weather forecast to clipboard! 📋', 'success');
        });
      });
    });

    const reactionBtns = container.querySelectorAll('.reaction-btn:not(.copy-btn)');
    reactionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        btn.style.color = '#2563eb';
        showToast('Thanks for your feedback!', 'info');
      });
    });
  }
  attachReactionHandlers();

  // Helper to format current time (e.g. 10:24 AM)
  function formatCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }

  // Send message function
  function sendUserMessage(text) {
    if (!text || !text.trim()) return;
    const timeStr = formatCurrentTime();

    // 1. Append User Message
    const userRow = document.createElement('div');
    userRow.className = 'message-row user-row';
    userRow.innerHTML = `
      <div class="message-wrapper">
        <span class="message-time">${timeStr}</span>
        <div class="user-bubble">
          <span>${escapeHTML(text)}</span>
          <span class="read-receipt">✓✓</span>
        </div>
      </div>
      <img src="assets/user-avatar.jpg" alt="Sid" class="chat-avatar user-chat-avatar">
    `;
    chatMessagesContainer.appendChild(userRow);
    scrollToBottom();

    // 2. Append Typing AI Placeholder
    const aiRow = document.createElement('div');
    aiRow.className = 'message-row ai-row';
    aiRow.innerHTML = `
      <div class="ai-avatar-circle">
        <svg viewBox="0 0 24 24" fill="none" class="bot-svg">
          <rect x="3" y="4" width="18" height="16" rx="4" fill="#2563EB"/>
          <circle cx="9" cy="11" r="1.5" fill="#FFFFFF"/>
          <circle cx="15" cy="11" r="1.5" fill="#FFFFFF"/>
          <line x1="8" y1="16" x2="16" y2="16" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="1" x2="12" y2="4" stroke="#2563EB" stroke-width="2"/>
          <circle cx="12" cy="1" r="1" fill="#2563EB"/>
        </svg>
      </div>
      <div class="ai-bubble-container">
        <div class="ai-bubble">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    chatMessagesContainer.appendChild(aiRow);
    scrollToBottom();

    // 3. Generate dynamic response
    setTimeout(() => {
      const responseHTML = generateAIResponse(text);
      const bubbleContainer = aiRow.querySelector('.ai-bubble-container');
      bubbleContainer.innerHTML = `
        <div class="ai-bubble">
          ${responseHTML}
        </div>
        <div class="msg-reaction-bar">
          <button type="button" class="reaction-btn" title="Helpful">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
          </button>
          <button type="button" class="reaction-btn" title="Not Helpful">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/></svg>
          </button>
          <button type="button" class="reaction-btn copy-btn" title="Copy response">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      `;
      attachReactionHandlers(aiRow);
      scrollToBottom();
    }, 1000);
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    if (q.includes('mumbai') || q.includes('weekend')) {
      return `
        <p class="ai-text-para">For <strong>Mumbai</strong> this weekend, expect overcast skies with intermittent coastal showers. Highs around <strong>30°C</strong>, lows <strong>25°C</strong> with 78% humidity.</p>
        <p class="ai-text-para bold-followup">Would you like a beach activity safety advisory?</p>
      `;
    } else if (q.includes('delhi') || q.includes('air quality') || q.includes('aqi')) {
      return `
        <p class="ai-text-para">The current Air Quality Index (AQI) in <strong>Delhi</strong> is <strong>142 (Moderate)</strong> with PM2.5 at 52 µg/m³. Sky conditions are hazy sunshine with 34°C.</p>
      `;
    } else if (q.includes('cyclone') || q.includes('bay of bengal')) {
      return `
        <p class="ai-text-para">The cyclonic depression in the North Bay of Bengal has weakened into a low-pressure trough. Coastal areas are advised for moderate sea swell warnings over the next 36 hours.</p>
      `;
    } else {
      return `
        <p class="ai-text-para">Based on satellite Doppler readings for your requested query, atmospheric pressure is steady at <strong>1008 hPa</strong> with good visibility and partly cloudy skies.</p>
        <p class="ai-text-para bold-followup">Can I provide specific hourly precipitation curves for you?</p>
      `;
    }
  }

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Chat submit form
  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = chatMessageInput?.value.trim() || '';
    if (val) {
      sendUserMessage(val);
      chatMessageInput.value = '';
    }
  });

  // Recent conversations click
  recentItems.forEach(item => {
    item.addEventListener('click', () => {
      recentItems.forEach(i => i.classList.remove('active-convo'));
      item.classList.add('active-convo');
      const query = item.getAttribute('data-query');
      if (query) {
        sendUserMessage(query);
      }
    });
  });

  // Voice Mic Tool
  chatMicBtn?.addEventListener('click', () => {
    chatMicBtn.style.color = '#ef4444';
    showToast('Listening... Speak your weather question 🎙️', 'info');
    setTimeout(() => {
      chatMicBtn.style.color = '';
      if (chatMessageInput) chatMessageInput.value = 'What is the UV index today?';
      sendUserMessage('What is the UV index today?');
      chatMessageInput.value = '';
    }, 1600);
  });

  // Attach tool
  chatAttachBtn?.addEventListener('click', () => {
    showToast('Location pin or weather photo attached.', 'info');
  });

  // Current Weather Refresh
  cwRefreshBtn?.addEventListener('click', () => {
    cwRefreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      cwRefreshBtn.style.transform = '';
      const nowStr = formatCurrentTime();
      if (cwUpdatedText) cwUpdatedText.textContent = `Updated ${nowStr}`;
      showToast('Current weather data refreshed ☀️', 'success');
    }, 400);
  });

  // Saved locations on right widget
  wSavedItems.forEach(item => {
    item.addEventListener('click', () => {
      const city = item.getAttribute('data-city') || 'Pune';
      wSavedItems.forEach(i => i.classList.remove('active-city'));
      item.classList.add('active-city');
      showToast(`Switched widget view to ${city}`, 'info');
    });
  });

  // Add location
  addLocationBtn?.addEventListener('click', () => {
    const newCity = prompt('Enter city name to add to saved locations:', 'Bengaluru, Karnataka');
    if (newCity && newCity.trim()) {
      showToast(`Added ${newCity} to Saved Locations!`, 'success');
    }
  });

  // Upgrade button
  upgradeBtn?.addEventListener('click', () => {
    showToast('WeatherGPT Premium: Unlimited 14-day forecasts & radar alerts!', 'success');
  });

  chatLangBtn?.addEventListener('click', () => {
    showToast('Supported Languages: English, Español, Français, हिन्दी, मराठी', 'info');
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
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }
});
