import React, { useState } from 'react';
import { useWeather } from '../context/WeatherContext';
import { 
  Search, 
  Plus, 
  Calendar, 
  MoreVertical, 
  Clock, 
  BarChart2, 
  Cloud, 
  Filter, 
  Trash2, 
  MessageSquare, 
  ChevronDown, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { WeatherIcon } from '../components/common/WeatherIcon';

export const HistoryPage = () => {
  const { 
    conversations, 
    user, 
    createNewChat, 
    setActiveConversationId, 
    setCurrentPage, 
    deleteConversation, 
    setIsPremiumModalOpen,
    addToast 
  } = useWeather();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeDateTab, setActiveDateTab] = useState('all'); // 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'custom'
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Filter checkboxes
  const [filters, setFilters] = useState({
    general: true,
    forecast: true,
    alert: true,
    airQuality: true,
    travel: true,
    other: true,
  });

  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'oldest' | 'messages'

  const dateTabs = [
    { id: 'all', label: 'All Conversations' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom' },
  ];

  const handleOpenConversation = (convId) => {
    setActiveConversationId(convId);
    setCurrentPage('chat');
  };

  // Filter conversations
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          conv.preview.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter by date tab
    if (activeDateTab === 'today' && !conv.dateGroup.includes('Today')) return false;
    if (activeDateTab === 'yesterday' && !conv.dateGroup.includes('Yesterday')) return false;

    // Filter by type
    if (conv.tag === 'General Query' && !filters.general) return false;
    if (conv.tag === 'Forecast' && !filters.forecast) return false;
    if (conv.tag === 'Alert' && !filters.alert) return false;
    if (conv.tag === 'Air Quality' && !filters.airQuality) return false;

    return true;
  });

  // Group by dateGroup
  const grouped = filteredConversations.reduce((acc, conv) => {
    const group = conv.dateGroup || 'Older';
    if (!acc[group]) acc[group] = [];
    acc[group].push(conv);
    return acc;
  }, {});

  const getTagColorClass = (tag) => {
    switch (tag) {
      case 'Alert':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900';
      case 'Forecast':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900';
      case 'Air Quality':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900';
      case 'General Query':
      default:
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900';
    }
  };

  const getIconBgClass = (icon) => {
    switch (icon) {
      case 'alert':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-500';
      case 'forecast':
      case 'sun-cloud':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-500';
      case 'wind':
      case 'shield':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500';
      case 'cyclone':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-500';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-[#151F32] border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Date</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={createNewChat}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Date Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-2 overflow-x-auto scrollbar-none">
        {dateTabs.map(tab => {
          const isActive = activeDateTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDateTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition relative ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Grouped History List (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {Object.keys(grouped).length > 0 ? (
            Object.entries(grouped).map(([dateGroup, items]) => (
              <div key={dateGroup} className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1">
                  {dateGroup}
                </h3>

                <div className="space-y-2.5">
                  {items.map(conv => (
                    <div
                      key={conv.id}
                      className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-card hover:shadow-md transition duration-200 flex items-center justify-between gap-4 group"
                    >
                      {/* Left: Icon & Query Text */}
                      <div 
                        onClick={() => handleOpenConversation(conv.id)}
                        className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getIconBgClass(conv.icon)}`}>
                          <WeatherIcon type={conv.icon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                            {conv.title}
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {conv.preview}
                          </p>
                        </div>
                      </div>

                      {/* Right: Time, Tag Pill, Action Menu */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
                          {conv.time}
                        </span>

                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${getTagColorClass(conv.tag)}`}>
                          {conv.tag}
                        </span>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === conv.id ? null : conv.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === conv.id && (
                            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-30 animate-fadeIn">
                              <button
                                onClick={() => {
                                  handleOpenConversation(conv.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Open in Chat</span>
                              </button>
                              <button
                                onClick={() => {
                                  deleteConversation(conv.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 space-y-3">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">No conversations found</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No history matches your current search or filter criteria. Start a new session with WeatherGPT.
              </p>
              <button
                onClick={createNewChat}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 mt-2"
              >
                <Plus className="w-4 h-4" /> Start New Chat
              </button>
            </div>
          )}

          {/* Bottom Footer Notice */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <Clock className="w-4 h-4" />
            <span>No more conversations to load</span>
          </div>
        </div>

        {/* Right Column: Filters, History Summary, Storage Usage (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Filters Card */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Filters</h3>
              <button
                onClick={() => {
                  setFilters({ general: true, forecast: true, alert: true, airQuality: true, travel: true, other: true });
                  setSearchQuery('');
                  addToast('Filters reset', 'info');
                }}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Date range dropdown */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Date Range
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>

            {/* Conversation Type Checkboxes */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Conversation Type
              </label>
              <div className="space-y-2">
                {[
                  { key: 'general', label: 'General Queries' },
                  { key: 'forecast', label: 'Weather Forecast' },
                  { key: 'alert', label: 'Alerts & Warnings' },
                  { key: 'airQuality', label: 'Air Quality' },
                  { key: 'travel', label: 'Travel & Activities' },
                  { key: 'other', label: 'Other' },
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={filters[item.key]}
                      onChange={e => setFilters(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 rounded-xs"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sort by */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 cursor-pointer focus:outline-none"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="messages">Most Messages</option>
              </select>
            </div>
          </div>

          {/* History Summary Card */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">History Summary</h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Total Conversations</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.stats.conversations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>This Week</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.stats.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>This Month</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.stats.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Messages</span>
                <span className="font-bold text-slate-900 dark:text-white">{user.stats.totalMessages}</span>
              </div>
            </div>
          </div>

          {/* Storage Usage Card */}
          <div className="bg-white dark:bg-[#151F32] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-card space-y-4">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Storage Usage</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You've used {user.stats.storageUsedPercent}% of your history storage.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${user.stats.storageUsedPercent}%` }}
              />
            </div>

            <button
              onClick={() => setIsPremiumModalOpen(true)}
              className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Upgrade for More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
