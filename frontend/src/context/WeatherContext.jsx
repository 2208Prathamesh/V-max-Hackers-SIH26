import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUser, defaultSettings, initialSavedLocations, initialConversations, activeAlerts, allCityDatabase } from '../data/mockData';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'chat' | 'alerts' | 'weather-map' | 'forecast' | 'history' | 'saved-locations' | 'settings' | 'login'
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('weathergpt_auth');
    return savedAuth !== null ? JSON.parse(savedAuth) : false; // Default to false to show login page
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('weathergpt_user');
    return saved ? JSON.parse(saved) : initialUser;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('weathergpt_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [savedLocations, setSavedLocations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_saved_locations');
    return saved ? JSON.parse(saved) : initialSavedLocations;
  });

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('weathergpt_conversations');
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [activeConversationId, setActiveConversationId] = useState('conv-1');
  const [selectedMapLocation, setSelectedMapLocation] = useState(initialSavedLocations[0]); // Default Pune
  const [alerts, setAlerts] = useState(activeAlerts);
  
  // Modals state
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('weathergpt_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);
  useEffect(() => {
    localStorage.setItem('weathergpt_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('weathergpt_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('weathergpt_saved_locations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  useEffect(() => {
    localStorage.setItem('weathergpt_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Toast Notification helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Temperature unit conversion
  const formatTemp = (tempInCelsius) => {
    if (tempInCelsius === undefined || tempInCelsius === null) return '--';
    if (settings.units.temperature === 'F') {
      const f = Math.round((tempInCelsius * 9) / 5 + 32);
      return `${f}°F`;
    }
    return `${Math.round(tempInCelsius)}°C`;
  };

  const formatTempRaw = (tempInCelsius) => {
    if (tempInCelsius === undefined || tempInCelsius === null) return '--';
    if (settings.units.temperature === 'F') {
      return Math.round((tempInCelsius * 9) / 5 + 32);
    }
    return Math.round(tempInCelsius);
  };

  // Wind speed conversion
  const formatWind = (speedKmh) => {
    if (speedKmh === undefined || speedKmh === null) return '--';
    const unit = settings.units.windSpeed;
    if (unit === 'mph') {
      return `${Math.round(speedKmh * 0.621371)} mph`;
    }
    if (unit === 'ms') {
      return `${Math.round(speedKmh / 3.6)} m/s`;
    }
    if (unit === 'knots') {
      return `${Math.round(speedKmh * 0.539957)} kn`;
    }
    return `${speedKmh} km/h`;
  };

  // Pressure conversion
  const formatPressure = (pressureHpa) => {
    if (!pressureHpa) return '--';
    const unit = settings.units.pressure;
    if (unit === 'inHg') {
      return `${(pressureHpa * 0.02953).toFixed(2)} inHg`;
    }
    if (unit === 'mmHg') {
      return `${Math.round(pressureHpa * 0.750062)} mmHg`;
    }
    if (unit === 'bar') {
      return `${(pressureHpa / 1000).toFixed(3)} bar`;
    }
    return `${pressureHpa} hPa`;
  };

  // Saved location actions
  const addLocation = (cityData) => {
    const exists = savedLocations.some(l => l.city.toLowerCase() === cityData.city.toLowerCase());
    if (exists) {
      addToast(`${cityData.city} is already in your saved locations!`, 'warning');
      return;
    }
    const newLoc = {
      ...cityData,
      id: `loc-${Date.now()}`,
      updatedTime: "Just now"
    };
    const updated = [...savedLocations, newLoc];
    setSavedLocations(updated);
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }));
    addToast(`${cityData.city} added to saved locations!`, 'success');
  };

  const removeLocation = (id) => {
    const loc = savedLocations.find(l => l.id === id);
    const updated = savedLocations.filter(l => l.id !== id);
    setSavedLocations(updated);
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, locationsSaved: updated.length }
    }));
    addToast(`Removed ${loc ? loc.city : 'location'}`, 'info');
  };

  const toggleFavorite = (id) => {
    setSavedLocations(prev =>
      prev.map(l => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l))
    );
  };

  // Settings update helpers
  const updateUnits = (key, value) => {
    setSettings(prev => ({
      ...prev,
      units: { ...prev.units, [key]: value }
    }));
    addToast(`Updated unit: ${key} to ${value}`, 'info');
  };

  const updateNotifications = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }));
  };

  const updateProfile = (updatedProfile) => {
    setUser(prev => ({
      ...prev,
      ...updatedProfile
    }));
    addToast("Profile updated successfully!", "success");
  };

  // Add message to current conversation or create a new chat
  const sendChatMessage = (text) => {
    if (!text.trim()) return;

    let targetConv = conversations.find(c => c.id === activeConversationId);
    let convId = activeConversationId;

    if (!targetConv) {
      convId = `conv-${Date.now()}`;
      targetConv = {
        id: convId,
        dateGroup: "Today – 21 May 2025",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: text.slice(0, 32) + (text.length > 32 ? '...' : ''),
        preview: text,
        tag: "General Query",
        tagColor: "blue",
        icon: "rain",
        messages: []
      };
      setConversations(prev => [targetConv, ...prev]);
      setActiveConversationId(convId);
    }

    const userMsg = {
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Simulate smart AI response with realistic weather reasoning
    let replyText = `WeatherGPT has analyzed the latest radar and satellite patterns for your query: "${text}". Conditions appear stable with typical seasonal characteristics.`;
    let cardData = null;

    const lower = text.toLowerCase();
    if (lower.includes('rain') || lower.includes('umbrella')) {
      replyText = `Based on high-resolution doppler radar imagery, cloud moisture density is elevated in the coastal convergence zones. Keep an umbrella handy!`;
      cardData = {
        city: "Mumbai / Pune",
        temp: 28,
        condition: "Rain Expected",
        rainProb: "75%",
        humidity: "82%",
        wind: "18 km/h"
      };
    } else if (lower.includes('delhi') || lower.includes('pollution') || lower.includes('aqi')) {
      replyText = `Delhi AQI currently reads 178 (Moderate/Unhealthy for sensitive groups). PM2.5 concentrations are higher in early morning and late evening.`;
    } else if (lower.includes('cyclone') || lower.includes('storm')) {
      replyText = `A deep depression in the Bay of Bengal continues to track north-northeastward with sustained winds near 55-65 km/h. Coastal monitoring stations are on active alert.`;
    }

    const aiMsg = {
      sender: "assistant",
      text: replyText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cardData
    };

    setConversations(prev =>
      prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            messages: [...c.messages, userMsg, aiMsg],
            preview: text
          };
        }
        return c;
      })
    );

    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, totalMessages: prev.stats.totalMessages + 2 }
    }));
  };

  const createNewChat = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      dateGroup: "Today – 21 May 2025",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: "New Conversation",
      preview: "Start asking about any city's weather...",
      tag: "General Query",
      tagColor: "blue",
      icon: "sun-cloud",
      messages: []
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newId);
    setCurrentPage('chat');
    addToast("Started new chat session", "info");
  };

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, conversations: Math.max(0, prev.stats.conversations - 1) }
    }));
    addToast("Conversation deleted", "info");
  };

  // Auth methods
  const login = (email, password) => {
    // Validate or login
    setIsAuthenticated(true);
    // If name exists or default
    const namePart = email ? email.split('@')[0] : "Weather Explorer";
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    
    // If logging in with demo or existing, keep full profile
    if (!email || email === initialUser.email) {
      setUser(initialUser);
    } else {
      setUser(prev => ({
        ...prev,
        name: formattedName,
        email: email,
        avatarInitials: formattedName.slice(0, 2).toUpperCase()
      }));
    }
    
    setCurrentPage('dashboard');
    addToast(`Welcome back to WeatherGPT!`, "success");
  };

  const signUp = ({ name, email, password }) => {
    const formattedName = name || (email ? email.split('@')[0] : "New Explorer");
    const newUser = {
      ...initialUser,
      name: formattedName,
      email: email || "user@weathergpt.ai",
      avatarInitials: formattedName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || "US",
      memberSince: "Today"
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
    addToast(`Account created successfully! Welcome, ${formattedName}`, "success");
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
    addToast("Logged out successfully", "info");
  };

  return (
    <WeatherContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        login,
        signUp,
        logout,
        currentPage,
        setCurrentPage,
        user,
        setUser,
        updateProfile,
        settings,
        setSettings,
        updateUnits,
        updateNotifications,
        savedLocations,
        allCityDatabase,
        addLocation,
        removeLocation,
        toggleFavorite,
        selectedMapLocation,
        setSelectedMapLocation,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendChatMessage,
        createNewChat,
        deleteConversation,
        alerts,
        formatTemp,
        formatTempRaw,
        formatWind,
        formatPressure,
        // Modals
        isAddLocationOpen,
        setIsAddLocationOpen,
        isPremiumModalOpen,
        setIsPremiumModalOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isForgotPasswordOpen,
        setIsForgotPasswordOpen,
        isAirQualityOpen,
        setIsAirQualityOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};
