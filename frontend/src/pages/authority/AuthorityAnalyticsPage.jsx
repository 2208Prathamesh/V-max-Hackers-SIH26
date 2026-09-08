import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { 
  BarChart2, 
  AlertTriangle, 
  MapPin, 
  Users, 
  TrendingUp, 
  ChevronDown, 
  Download,
  Calendar,
  Activity,
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { authorityAnalyticsData } from '../../data/mockAuthorityData';

export const AuthorityAnalyticsPage = () => {
  const { addToast } = useWeather();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [activeSegmentHover, setActiveSegmentHover] = useState(null);

  const timeRanges = ['Last 7 Days', 'Last 30 Days', 'This Quarter', 'This Monsoon Season', 'Year 2025'];

  const metrics = [
    {
      id: 'total-alerts',
      count: authorityAnalyticsData.summary.totalAlerts,
      label: 'Total Alerts',
      icon: BarChart2,
      iconBg: 'bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-200/80 dark:border-blue-900/30'
    },
    {
      id: 'critical-alerts',
      count: authorityAnalyticsData.summary.criticalAlerts,
      label: 'Critical Alerts',
      icon: AlertTriangle,
      iconBg: 'bg-red-500/15 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      borderClass: 'border-red-200/80 dark:border-red-900/30'
    },
    {
      id: 'affected-areas',
      count: authorityAnalyticsData.summary.affectedAreas,
      label: 'Affected Areas',
      icon: MapPin,
      iconBg: 'bg-blue-500/15 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      borderClass: 'border-blue-200/80 dark:border-blue-900/30'
    },
    {
      id: 'users-notified',
      count: authorityAnalyticsData.summary.usersNotified,
      label: 'Users Notified',
      icon: Users,
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      borderClass: 'border-emerald-200/80 dark:border-emerald-900/30'
    }
  ];

  // SVG Area Chart points calculated for timeline
  // 1 Sep: 8, 5 Sep: 6, 10 Sep: 10, 15 Sep: 18, 20 Sep: 12, 25 Sep: 7, 30 Sep: 16
  const areaPoints = "40,130 100,145 160,115 220,50 280,100 340,140 400,65";
  const areaFillPoints = "40,180 40,130 100,145 160,115 220,50 280,100 340,140 400,65 400,180";

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Header & Date Range Filter matching Image 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Insights and trends for better decision making
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                addToast(`Analytics time range updated to ${e.target.value}`, 'info');
              }}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#111C2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer"
            >
              {timeRanges.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => addToast('Exporting State Disaster Analytics Report (PDF)', 'success')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
            title="Download Report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards matching Image 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.id}
              className={`bg-white dark:bg-[#111C2E] p-5 rounded-3xl border ${m.borderClass} shadow-sm hover:shadow-md transition duration-200 flex items-center gap-4`}
            >
              <div className={`w-13 h-13 rounded-2xl flex items-center justify-center flex-shrink-0 ${m.iconBg}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                  {m.count}
                </span>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  {m.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Core Analytics Charts matching Image 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Alerts by Severity (Donut Chart - 4 Cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Alerts by Severity
          </h2>

          <div className="flex items-center justify-between gap-4">
            {/* SVG Donut Chart with center label */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="currentColor" strokeWidth="14" className="text-slate-100 dark:text-slate-800" />
                
                {/* Critical (Red) - 12/48 = 25% = 59.7 dash */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray="59.7 238.8"
                  strokeDashoffset="0"
                  className="transition-all duration-300 hover:opacity-80"
                />
                
                {/* High (Orange) - 15/48 = 31.25% = 74.6 dash */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="14"
                  strokeDasharray="74.6 238.8"
                  strokeDashoffset="-59.7"
                  className="transition-all duration-300 hover:opacity-80"
                />

                {/* Moderate (Yellow) - 14/48 = 29.16% = 69.6 dash */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EAB308"
                  strokeWidth="14"
                  strokeDasharray="69.6 238.8"
                  strokeDashoffset="-134.3"
                  className="transition-all duration-300 hover:opacity-80"
                />

                {/* Low (Green) - 7/48 = 14.58% = 34.8 dash */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#22C55E"
                  strokeWidth="14"
                  strokeDasharray="34.8 238.8"
                  strokeDashoffset="-203.9"
                  className="transition-all duration-300 hover:opacity-80"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                  48
                </span>
                <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                  Total
                </span>
              </div>
            </div>

            {/* Severity Legend */}
            <div className="space-y-2 text-xs font-semibold flex-1">
              {authorityAnalyticsData.severityBreakdown.map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${s.bgClass}`} />
                    <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            <span>25% of alerts categorized under Red emergency tier.</span>
          </div>
        </div>

        {/* CHART 2: Alerts Over Time (Area Chart - 5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Alerts Over Time
            </h2>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
              Monsoon Wave 3
            </span>
          </div>

          {/* Smooth SVG Area Chart matching Image 5 */}
          <div className="relative h-44 w-full my-auto">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 440 200">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="50" x2="400" y2="50" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
              <line x1="40" y1="110" x2="400" y2="110" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />
              <line x1="40" y1="170" x2="400" y2="170" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="3 3" />

              {/* Y Axis Labels */}
              <text x="25" y="55" fill="#94A3B8" fontSize="10" fontWeight="bold">20</text>
              <text x="25" y="115" fill="#94A3B8" fontSize="10" fontWeight="bold">10</text>
              <text x="30" y="175" fill="#94A3B8" fontSize="10" fontWeight="bold">0</text>

              {/* Area Fill */}
              <polygon points={areaFillPoints} fill="url(#areaGrad)" />

              {/* Area Stroke Line */}
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={areaPoints}
              />

              {/* Data Points / Circles */}
              {[
                { cx: 40, cy: 130, val: 8 },
                { cx: 100, cy: 145, val: 6 },
                { cx: 160, cy: 115, val: 10 },
                { cx: 220, cy: 50, val: 18 },
                { cx: 280, cy: 100, val: 12 },
                { cx: 340, cy: 140, val: 7 },
                { cx: 400, cy: 65, val: 16 }
              ].map((p, i) => (
                <circle
                  key={i}
                  cx={p.cx}
                  cy={p.cy}
                  r="4.5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="hover:scale-150 transition cursor-pointer"
                />
              ))}

              {/* X Axis Date Labels */}
              {authorityAnalyticsData.timeline.map((item, i) => (
                <text
                  key={item.label}
                  x={40 + i * 60}
                  y="195"
                  textAnchor="middle"
                  fill="#94A3B8"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  {item.label}
                </text>
              ))}
            </svg>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Peak alert frequency recorded on 15 Sep.</span>
          </div>
        </div>

        {/* CHART 3: Top Affected Districts (Horizontal Bar Chart - 3 Cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
            Top Affected Districts
          </h2>

          {/* Horizontal Progress Bars */}
          <div className="space-y-4">
            {authorityAnalyticsData.topDistricts.map((d) => (
              <div key={d.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className="text-slate-900 dark:text-white">{d.count}</span>
                </div>
                
                {/* Progress Track */}
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${(d.count / d.max) * 100}%` }}
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            <span>Pune & Mumbai represent 42% of total state warnings.</span>
          </div>
        </div>

      </div>

      {/* Authority Intelligence Summary Banner */}
      <div className="bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-transparent p-5 rounded-3xl border border-blue-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              State Meteorological Advisory Readiness
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated civil warning broadcasts active across all 36 Maharashtra collectorates.
            </p>
          </div>
        </div>

        <button
          onClick={() => addToast('System Readiness Report Generated (Grade A+)', 'success')}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition cursor-pointer shrink-0"
        >
          Check Collectorate Sync
        </button>
      </div>

    </div>
  );
};
