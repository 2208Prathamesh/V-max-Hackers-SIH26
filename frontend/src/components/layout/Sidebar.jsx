import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Home,
  MessageSquare, 
  Bell, 
  Map, 
  Calendar,
  Clock, 
  Star, 
  Settings, 
  ChevronRight,
  ChevronDown,
  Sun, 
  Moon, 
  LogOut,
  User as UserIcon,
  SunMedium,
  Sprout
} from 'lucide-react';

// 3D Styled Cloud & Sun Logo for Sidebar
const WeatherGPTSidebarLogo = () => (
  <div className="flex items-center gap-2.5 select-none">
    <div className="relative w-9 h-8 flex items-center justify-center">
      {/* Golden Glowing Sun behind cloud */}
      <div className="absolute top-0 right-0.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-yellow-200 shadow-[0_0_8px_rgba(250,204,21,0.7)] flex items-center justify-center">
        <SunMedium className="w-3 h-3 text-amber-800/40" />
      </div>
      {/* 3D Puffy Cloud */}
      <div className="relative z-10 filter drop-shadow-xs">
        <svg className="w-8 h-6" viewBox="0 0 64 44" fill="none">
          <path
            d="M48 38H16C8.82 38 3 32.18 3 25C3 18.23 8.16 12.67 14.85 12.06C17.65 5.16 24.47 0.5 32.5 0.5C42.06 0.5 49.98 7.37 51.64 16.48C57.48 17.58 61.5 22.68 61.5 28.5C61.5 33.75 57.25 38 52 38H48Z"
            fill="url(#sidebarCloudGrad)"
          />
          <defs>
            <linearGradient id="sidebarCloudGrad" x1="10" y1="5" x2="55" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.5" stopColor="#60A5FA" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
    <span className="text-xl font-bold tracking-tight text-[#2563EB] dark:text-blue-400 font-sans">
      WeatherGPT
    </span>
  </div>
);

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { 
    currentPage, 
    setCurrentPage, 
    user,
    conversations = [],
    logout,
    setIsEditProfileOpen,
    setActiveConversationId
  } = useWeather();
  const { isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'chat', label: t('chat'), icon: MessageSquare },
    { id: 'advisory', label: t('advisory'), icon: Sprout },
    { id: 'alerts', label: t('alerts'), icon: Bell, badge: '3' },
    { id: 'weather-map', label: t('weatherMap'), icon: Map },
    { id: 'forecast', label: t('forecast'), icon: Calendar },
    { id: 'history', label: t('history'), icon: Clock },
    { id: 'saved-locations', label: t('savedLocations'), icon: Star },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const recentChats = conversations.length
    ? conversations.slice(0, 5).map(c => ({
        id: c.id,
        title: c.title,
        time: c.time || (language === 'mr' ? 'अलीकडील' : language === 'hi' ? 'हालिया' : 'Recent')
      }))
    : [];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleRecentChatClick = (chatId) => {
    setActiveConversationId(chatId);
    setCurrentPage('chat');
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-screen w-64 bg-white dark:bg-[#111C2E] border-r border-slate-100 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Section: Logo & Main Navigation */}
      <div className="px-4 py-5 space-y-5 overflow-y-auto flex-1">
        {/* Brand Header */}
        <div 
          onClick={() => handleNavClick('dashboard')}
          className="px-2 cursor-pointer transition hover:opacity-90"
        >
          <WeatherGPTSidebarLogo />
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="w-5 h-5 rounded-full bg-[#EF4444] text-white text-[10px] flex items-center justify-center font-bold shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Recent Conversations */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 tracking-tight">
              {t('recentConversations')}
            </span>
          </div>
          <div className="space-y-1">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleRecentChatClick(chat.id)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group flex items-start justify-between gap-1"
              >
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {chat.title}
                </p>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 mt-0.5">
                  {chat.time}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => handleNavClick('history')}
            className="flex items-center gap-1 px-2.5 py-1 mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            <span>{t('viewAll')}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>



      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 relative">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="w-full flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover shadow-xs shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                {user.avatarInitials || 'SP'}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0" />
        </button>

        {/* User Popup Dropdown */}
        {isUserMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 space-y-1 z-50 animate-fadeIn">
            <button
              onClick={() => {
                setIsEditProfileOpen(true);
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span>{t('editProfile')}</span>
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{isDark ? t('lightTheme') : t('darkTheme')}</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('settings');
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{t('accountSettings')}</span>
            </button>
            <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
            <button
              onClick={() => {
                logout();
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
