import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Home,
  MessageSquare, 
  Bell, 
  Map, 
  Calendar,
  Clock, 
  Star, 
  Settings, 
  Crown,
  ChevronRight,
  ChevronDown,
  Sun, 
  Moon, 
  LogOut,
  User as UserIcon,
  SunMedium,
  BarChart2,
  Shield
} from 'lucide-react';

// 3D Styled Cloud & Sun Logo for Sidebar
const WeatherGPTSidebarLogo = ({ isAuthority }) => (
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
    <div>
      <span className="text-xl font-bold tracking-tight text-[#2563EB] dark:text-blue-400 font-sans leading-none block">
        WeatherGPT
      </span>
      {isAuthority && (
        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          Authority
        </span>
      )}
    </div>
  </div>
);

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { 
    currentPage, 
    setCurrentPage, 
    user,
    logout,
    setIsPremiumModalOpen,
    setIsEditProfileOpen,
    setActiveConversationId
  } = useWeather();
  const { isDark, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthority = user?.role === 'authority';

  const authorityNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '12' },
    { id: 'weather-map', label: 'Weather Map', icon: Map },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: '3' },
    { id: 'weather-map', label: 'Weather Map', icon: Map },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'saved-locations', label: 'Saved Locations', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const navItems = isAuthority ? authorityNavItems : userNavItems;

  const recentChats = [
    { id: 'conv-1', title: 'Will it rain tomorrow in Pune?', time: '10:21 AM' },
    { id: 'conv-3', title: 'Weather this weekend in Mumbai', time: 'Yesterday' },
    { id: 'conv-5', title: 'Cyclone update in Bay of Bengal', time: '2 days ago' },
    { id: 'conv-4', title: 'Air quality in Delhi', time: '2 days ago' },
    { id: 'conv-6', title: "Tomorrow's temperature in Nagpur", time: '3 days ago' },
  ];

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
          <WeatherGPTSidebarLogo isAuthority={isAuthority} />
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

        {/* Middle Section: For User -> Recent Chats & Premium; For Authority -> Emergency Center Info */}
        {!isAuthority ? (
          <>
            {/* Recent Conversations */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[11px] font-bold text-slate-900 dark:text-slate-200 tracking-tight">
                  Recent Conversations
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
                <span>View all</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Go Premium Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/30 space-y-2">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">Go Premium</span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                Unlock advanced alerts, longer forecasts and custom notifications.
              </p>
              <button
                onClick={() => setIsPremiumModalOpen(true)}
                className="w-full py-1.5 px-3 bg-white dark:bg-amber-900/40 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
              >
                Upgrade Now
              </button>
            </div>
          </>
        ) : (
          /* Authority Operational Status Box */
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                  State Advisory System
                </span>
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                Level 2 Monsoon Monitoring active across 7 vulnerable districts.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 border-t border-blue-200/60 dark:border-blue-900/40">
                <span>Emergency: 1070 / 112</span>
                <span className="text-emerald-600 dark:text-emerald-400">ONLINE</span>
              </div>
            </div>
          </div>
        )}

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
                {user.avatarInitials || (user.role === 'authority' ? 'AA' : 'SP')}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                {user.role === 'authority' ? (user.state || 'Maharashtra State') : user.email}
              </p>
              {user.role === 'authority' && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-xs">
                  Authority
                </span>
              )}
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
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => {
                toggleTheme();
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
              <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
            <button
              onClick={() => {
                handleNavClick('settings');
                setIsUserMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Account Settings</span>
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
              <span>Log Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
