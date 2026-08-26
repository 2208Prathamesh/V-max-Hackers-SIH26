/**
 * WeatherGPT Login Page Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const emailGroup = document.getElementById('emailGroup');
  const passwordGroup = document.getElementById('passwordGroup');
  const emailFeedback = document.getElementById('emailFeedback');
  const passwordFeedback = document.getElementById('passwordFeedback');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const eyeOpenIcon = togglePasswordBtn?.querySelector('.eye-open');
  const eyeClosedIcon = togglePasswordBtn?.querySelector('.eye-closed');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const toastContainer = document.getElementById('toastContainer');
  const socialGoogleBtn = document.getElementById('socialGoogleBtn');
  const socialAppleBtn = document.getElementById('socialAppleBtn');
  const socialMicrosoftBtn = document.getElementById('socialMicrosoftBtn');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const signupLink = document.getElementById('signupLink');
  const quoteCard = document.getElementById('quoteCard');

  // Weather Wisdom Quotes Rotator
  const quotes = [
    {
      text: "“The best time to plant a tree was 20 years ago. The second best time is now.”",
      author: "— Weather wisdom"
    },
    {
      text: "“Wherever you go, no matter what the weather, always bring your own sunshine.”",
      author: "— Anthony J. D'Angelo"
    },
    {
      text: "“Sunshine is delicious, rain is refreshing, wind braces us up, snow is exhilarating.”",
      author: "— John Ruskin"
    },
    {
      text: "“To appreciate the beauty of a snowflake, it is necessary to stand out in the cold.”",
      author: "— Aristotle"
    }
  ];

  let currentQuoteIndex = 0;
  if (quoteCard) {
    quoteCard.addEventListener('click', () => {
      currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
      const textElem = quoteCard.querySelector('.quote-text');
      const authorElem = quoteCard.querySelector('.quote-author');
      
      quoteCard.style.opacity = '0.5';
      quoteCard.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        if (textElem) textElem.textContent = quotes[currentQuoteIndex].text;
        if (authorElem) authorElem.textContent = quotes[currentQuoteIndex].author;
        quoteCard.style.opacity = '1';
        quoteCard.style.transform = 'scale(1)';
      }, 150);
    });
  }

  // 1. Password Visibility Toggle
  if (togglePasswordBtn && passwordInput && eyeOpenIcon && eyeClosedIcon) {
    togglePasswordBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const isPassword = passwordInput.getAttribute('type') === 'password';
      if (isPassword) {
        passwordInput.setAttribute('type', 'text');
        eyeOpenIcon.style.display = 'none';
        eyeClosedIcon.style.display = 'block';
        togglePasswordBtn.setAttribute('aria-label', 'Hide password');
      } else {
        passwordInput.setAttribute('type', 'password');
        eyeOpenIcon.style.display = 'block';
        eyeClosedIcon.style.display = 'none';
        togglePasswordBtn.setAttribute('aria-label', 'Show password');
      }
      passwordInput.focus();
    });
  }

  // 2. Real-time Validation Helpers
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const clearFieldError = (groupElem, feedbackElem) => {
    if (groupElem) groupElem.classList.remove('has-error');
    if (feedbackElem) feedbackElem.textContent = '';
  };

  const setFieldError = (groupElem, feedbackElem, message) => {
    if (groupElem) groupElem.classList.add('has-error');
    if (feedbackElem) feedbackElem.textContent = message;
  };

  emailInput?.addEventListener('input', () => {
    if (emailGroup?.classList.contains('has-error')) {
      if (emailInput.value.trim() && validateEmail(emailInput.value.trim())) {
        clearFieldError(emailGroup, emailFeedback);
      }
    }
  });

  passwordInput?.addEventListener('input', () => {
    if (passwordGroup?.classList.contains('has-error')) {
      if (passwordInput.value.length >= 6) {
        clearFieldError(passwordGroup, passwordFeedback);
      }
    }
  });

  // 3. Form Submit Handling
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    // Validate email
    const emailVal = emailInput?.value.trim() || '';
    if (!emailVal) {
      setFieldError(emailGroup, emailFeedback, 'Please enter your email address.');
      hasError = true;
    } else if (!validateEmail(emailVal)) {
      setFieldError(emailGroup, emailFeedback, 'Please enter a valid email address.');
      hasError = true;
    } else {
      clearFieldError(emailGroup, emailFeedback);
    }

    // Validate password
    const passVal = passwordInput?.value || '';
    if (!passVal) {
      setFieldError(passwordGroup, passwordFeedback, 'Please enter your password.');
      hasError = true;
    } else if (passVal.length < 6) {
      setFieldError(passwordGroup, passwordFeedback, 'Password must be at least 6 characters.');
      hasError = true;
    } else {
      clearFieldError(passwordGroup, passwordFeedback);
    }

    if (hasError) {
      return;
    }

    // Simulate login loading state
    const originalBtnHTML = loginSubmitBtn.innerHTML;
    loginSubmitBtn.disabled = true;
    loginSubmitBtn.style.opacity = '0.85';
    loginSubmitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 0.8s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25" stroke="currentColor"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"/>
      </svg>
      <span>Logging in...</span>
    `;

    setTimeout(() => {
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.style.opacity = '1';
      loginSubmitBtn.innerHTML = originalBtnHTML;
      sessionStorage.setItem('weathergpt_authenticated', 'true');
      showToast(`Welcome back to WeatherGPT! ☀️ Redirecting to Dashboard...`, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    }, 1000);
  });

  // 4. Social Logins Simulated Interactions
  const setupSocialLogin = (btn, provider) => {
    btn?.addEventListener('click', () => {
      showToast(`Connecting to ${provider} authentication...`, 'info');
      setTimeout(() => {
        showToast(`Successfully connected via ${provider}!`, 'success');
      }, 1000);
    });
  };

  setupSocialLogin(socialGoogleBtn, 'Google');
  setupSocialLogin(socialAppleBtn, 'Apple');
  setupSocialLogin(socialMicrosoftBtn, 'Microsoft');

  // 5. Auxiliary links
  forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your email if registered.', 'info');
  });

  signupLink?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Redirecting to WeatherGPT Registration...', 'info');
  });

  // 6. Toast Notification Helper
  function showToast(message, type = 'info') {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  }
});
