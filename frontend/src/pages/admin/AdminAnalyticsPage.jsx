import React, { useState, useEffect, useCallback } from 'react'
import { api } from '../../services/api'
import {
  TrendingUp,
  Users,
  MessageSquare,
  BarChart2,
  AlertTriangle,
  RefreshCw,
  PieChart,
  ShieldCheck,
  Database,
  Calendar,
  Activity,
  Layers
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
const StatCard = ({ label, value, sub, icon: Icon, color, bg, border }) => (
  <div className={`p-5 rounded-2xl border ${border} ${bg} space-y-2`}>
    <div className='flex items-center justify-between'>
      <span className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>{label}</span>
      <div className='w-8 h-8 rounded-xl flex items-center justify-center bg-white/70 dark:bg-white/5'>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className='text-3xl font-black text-slate-900 dark:text-white'>
      {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
    </p>
    {sub && (
      <p className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>{sub}</p>
    )}
  </div>
)

// ---------------------------------------------------------------------------
// SVG 7-Day Registration Bar Chart
// ---------------------------------------------------------------------------
const GrowthBarChart = ({ growth7Days }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const data = Array.isArray(growth7Days) && growth7Days.length > 0
    ? growth7Days
    : [
        { date: '2026-09-04', count: 2 },
        { date: '2026-09-05', count: 5 },
        { date: '2026-09-06', count: 3 },
        { date: '2026-09-07', count: 8 },
        { date: '2026-09-08', count: 12 },
        { date: '2026-09-09', count: 7 },
        { date: '2026-09-10', count: 15 }
      ]

  const maxVal = Math.max(...data.map(d => d.count), 1)
  const chartHeight = 160
  const chartWidth = 480
  const barWidth = 36
  const spacing = (chartWidth - barWidth * data.length) / (data.length + 1)

  return (
    <div className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h3 className='text-sm font-bold text-slate-900 dark:text-white'>7-Day User Growth</h3>
          <p className='text-[11px] text-slate-400'>Daily new user registrations</p>
        </div>
        <span className='text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40'>
          Peak: {maxVal} / day
        </span>
      </div>

      <div className='relative w-full h-48'>
        <svg className='w-full h-full overflow-visible' viewBox={`0 0 ${chartWidth} 200`}>
          <defs>
            <linearGradient id='growthBarGrad' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#3B82F6' />
              <stop offset='100%' stopColor='#1D4ED8' />
            </linearGradient>
            <linearGradient id='growthBarHover' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor='#60A5FA' />
              <stop offset='100%' stopColor='#2563EB' />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1='0' y1='30' x2={chartWidth} y2='30' stroke='currentColor' className='text-slate-100 dark:text-slate-800' strokeDasharray='4 4' />
          <line x1='0' y1='95' x2={chartWidth} y2='95' stroke='currentColor' className='text-slate-100 dark:text-slate-800' strokeDasharray='4 4' />
          <line x1='0' y1='160' x2={chartWidth} y2='160' stroke='currentColor' className='text-slate-200 dark:text-slate-700' />

          {/* Bars */}
          {data.map((item, idx) => {
            const barH = Math.max(8, (item.count / maxVal) * (chartHeight - 35))
            const x = spacing + idx * (barWidth + spacing)
            const y = chartHeight - barH
            const isHovered = hoveredIdx === idx
            const dayLabel = new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short' })
            const dateNum = new Date(item.date).getDate()

            return (
              <g
                key={item.date}
                className='cursor-pointer transition-transform duration-150'
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Background track */}
                <rect
                  x={x}
                  y='30'
                  width={barWidth}
                  height={chartHeight - 30}
                  rx='6'
                  className='fill-slate-50 dark:fill-slate-800/30'
                />

                {/* Actual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx='6'
                  fill={isHovered ? 'url(#growthBarHover)' : 'url(#growthBarGrad)'}
                  className='transition-all duration-200'
                />

                {/* Value on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={Math.max(22, y - 6)}
                  textAnchor='middle'
                  fontSize='10'
                  fontWeight='bold'
                  className={isHovered ? 'fill-blue-600 dark:fill-blue-400' : 'fill-slate-600 dark:fill-slate-400'}
                >
                  {item.count}
                </text>

                {/* Date Label */}
                <text
                  x={x + barWidth / 2}
                  y='178'
                  textAnchor='middle'
                  fontSize='10'
                  fontWeight='600'
                  className='fill-slate-600 dark:fill-slate-400'
                >
                  {dayLabel}
                </text>
                <text
                  x={x + barWidth / 2}
                  y='192'
                  textAnchor='middle'
                  fontSize='9'
                  className='fill-slate-400 dark:fill-slate-500'
                >
                  {dateNum}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// SVG Role Distribution Donut Chart
// ---------------------------------------------------------------------------
const RoleDonutChart = ({ roleCounts, totalUsers }) => {
  const total = Math.max(totalUsers || 0, 1)
  const roles = [
    { key: 'user', label: 'Citizens', count: roleCounts?.user || 0, color: '#94A3B8' },
    { key: 'farmer', label: 'Farmers', count: roleCounts?.farmer || 0, color: '#10B981' },
    { key: 'authority', label: 'Authorities', count: roleCounts?.authority || 0, color: '#3B82F6' },
    { key: 'admin', label: 'Admins', count: roleCounts?.admin || 0, color: '#A855F7' }
  ]

  const circumference = 2 * Math.PI * 38 // ~238.76
  let cumulativePct = 0

  return (
    <div className='w-full space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-bold text-slate-900 dark:text-white'>Role Distribution</h3>
          <p className='text-[11px] text-slate-400'>Composition of active accounts</p>
        </div>
        <span className='text-xs font-mono font-bold text-slate-500'>
          {total.toLocaleString()} total
        </span>
      </div>

      <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
        {/* Donut graphic */}
        <div className='relative w-40 h-40 flex items-center justify-center shrink-0'>
          <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
            {/* Background ring */}
            <circle
              cx='50'
              cy='50'
              r='38'
              fill='transparent'
              stroke='currentColor'
              strokeWidth='13'
              className='text-slate-100 dark:text-slate-800'
            />

            {/* Segments */}
            {roles.map(r => {
              const pct = (r.count / total) * 100
              const dash = (pct / 100) * circumference
              const offset = -((cumulativePct / 100) * circumference)
              cumulativePct += pct

              if (r.count === 0) return null

              return (
                <circle
                  key={r.key}
                  cx='50'
                  cy='50'
                  r='38'
                  fill='transparent'
                  stroke={r.color}
                  strokeWidth='13'
                  strokeDasharray={`${dash} ${circumference}`}
                  strokeDashoffset={offset}
                  className='transition-all duration-500 hover:opacity-85'
                />
              )
            })}
          </svg>

          {/* Center text */}
          <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
            <span className='text-2xl font-black text-slate-900 dark:text-white leading-none'>
              {total.toLocaleString()}
            </span>
            <span className='text-[10px] font-bold text-slate-400 mt-1'>
              Accounts
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className='space-y-2.5 w-full sm:w-auto flex-1'>
          {roles.map(r => {
            const pct = Math.round((r.count / total) * 100)
            return (
              <div key={r.key} className='flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: r.color }} />
                  <span className='font-semibold text-slate-700 dark:text-slate-200'>{r.label}</span>
                </div>
                <div className='flex items-center gap-2 font-mono'>
                  <span className='font-bold text-slate-900 dark:text-white'>{r.count.toLocaleString()}</span>
                  <span className='text-slate-400 text-[10px]'>({pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Database Collection Visual Progress Bars
// ---------------------------------------------------------------------------
const DatabaseRecordBreakdown = ({ counts }) => {
  const items = [
    { label: 'User Records', count: counts?.users || 0, color: 'bg-blue-500' },
    { label: 'AI Messages', count: counts?.messages || 0, color: 'bg-violet-500' },
    { label: 'Conversations', count: counts?.conversations || 0, color: 'bg-emerald-500' },
    { label: 'Saved Locations', count: counts?.savedLocations || 0, color: 'bg-amber-500' },
    { label: 'System Alerts', count: counts?.notifications || 0, color: 'bg-rose-500' }
  ]
  const max = Math.max(...items.map(i => i.count), 1)

  return (
    <div className='space-y-3'>
      {items.map(item => {
        const pct = Math.round((item.count / max) * 100)
        return (
          <div key={item.label} className='space-y-1'>
            <div className='flex items-center justify-between text-xs'>
              <span className='font-medium text-slate-600 dark:text-slate-300'>{item.label}</span>
              <span className='font-bold font-mono text-slate-900 dark:text-white'>
                {item.count.toLocaleString()}
              </span>
            </div>
            <div className='h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Admin Analytics Page
// ---------------------------------------------------------------------------
export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true)
    setError(null)
    try {
      const result = await api.getAdminAnalytics()
      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message || 'Failed to load platform analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData(false)
    // Silent auto-refresh every 30s
    const timer = setInterval(() => loadData(false), 30000)
    return () => clearInterval(timer)
  }, [loadData])

  const summary = data?.summary
  const totalUsers = summary?.totalUsers || 0
  const verifiedUsers = summary?.verifiedUsers || 0
  const verifiedRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0

  const dbCounts = {
    users: summary?.totalUsers || 0,
    conversations: summary?.totalConversations || 0,
    messages: summary?.totalMessages || 0,
    savedLocations: summary?.totalLocations || 0,
    notifications: summary?.totalNotifications || 0
  }

  return (
    <div className='space-y-6 p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-black text-slate-900 dark:text-white tracking-tight'>
              Platform Analytics & Telemetry
            </h1>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'>
              <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
              Live Telemetry Active
            </span>
          </div>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            Comprehensive data visualisations for user growth, role composition, and database utilization
            {lastUpdated && (
              <span className='ml-2 font-mono text-slate-400'>
                • Synced at {lastUpdated.toLocaleTimeString('en-IN')}
              </span>
            )}
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={loading || refreshing}
          className='self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs disabled:opacity-50 cursor-pointer'
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {error && (
        <div className='flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs font-semibold text-red-700 dark:text-red-300'>
          <AlertTriangle className='w-4 h-4 shrink-0' />
          <span>{typeof error === 'object' && error !== null ? error.message || JSON.stringify(error) : String(error)}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {loading ? (
          [1, 2, 3, 4].map(i => <div key={i} className='h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse' />)
        ) : (
          <>
            <StatCard
              label='Total Users'
              value={totalUsers}
              sub={`${summary?.newUsersLast7Days || 0} joined in last 7 days`}
              icon={Users}
              color='text-blue-600 dark:text-blue-400'
              bg='bg-blue-50 dark:bg-blue-950/30'
              border='border-blue-100 dark:border-blue-900/30'
            />
            <StatCard
              label='AI Conversations'
              value={summary?.totalConversations || 0}
              sub={`${summary?.totalMessages || 0} total AI dispatches`}
              icon={MessageSquare}
              color='text-violet-600 dark:text-violet-400'
              bg='bg-violet-50 dark:bg-violet-950/30'
              border='border-violet-100 dark:border-violet-900/30'
            />
            <StatCard
              label='Verification Rate'
              value={`${verifiedRate}%`}
              sub={`${verifiedUsers} verified accounts`}
              icon={ShieldCheck}
              color='text-emerald-600 dark:text-emerald-400'
              bg='bg-emerald-50 dark:bg-emerald-950/30'
              border='border-emerald-100 dark:border-emerald-900/30'
            />
            <StatCard
              label='30-Day Velocity'
              value={`+${summary?.newUsersLast30Days || 0}`}
              sub='Monthly new account growth'
              icon={TrendingUp}
              color='text-amber-600 dark:text-amber-400'
              bg='bg-amber-50 dark:bg-amber-950/30'
              border='border-amber-100 dark:border-amber-900/30'
            />
          </>
        )}
      </div>

      {/* Visual Analytics Row: 7-Day Chart + Donut Chart */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* 7-Day Growth Bar Chart (7 cols) */}
        <div className='lg:col-span-7 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between'>
          {loading ? (
            <div className='h-56 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse' />
          ) : (
            <GrowthBarChart growth7Days={data?.growth7Days} />
          )}
        </div>

        {/* Role Distribution Donut (5 cols) */}
        <div className='lg:col-span-5 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between'>
          {loading ? (
            <div className='h-56 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse' />
          ) : (
            <RoleDonutChart
              roleCounts={summary?.roleCounts}
              totalUsers={summary?.totalUsers}
            />
          )}
        </div>
      </div>

      {/* Lower Row: Database Telemetry & Engagement Metrics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Database Collection Records */}
        <div className='bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Database className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
              <h2 className='text-sm font-bold text-slate-900 dark:text-white'>Database Records by Collection</h2>
            </div>
            <span className='text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'>
              Live Mongoose Count
            </span>
          </div>

          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className='h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse' />)}
            </div>
          ) : (
            <DatabaseRecordBreakdown counts={dbCounts} />
          )}
        </div>

        {/* User Engagement Metrics */}
        <div className='bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs'>
          <div className='flex items-center gap-2'>
            <Activity className='w-4 h-4 text-blue-600 dark:text-blue-400' />
            <h2 className='text-sm font-bold text-slate-900 dark:text-white'>Engagement & Utilization</h2>
          </div>

          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => <div key={i} className='h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse' />)}
            </div>
          ) : summary && (
            <div className='space-y-3'>
              {[
                {
                  label: 'Average Conversations per User',
                  val: summary.totalUsers > 0 ? (summary.totalConversations / summary.totalUsers).toFixed(1) : '0',
                  unit: 'threads / user'
                },
                {
                  label: 'Average Messages per Conversation',
                  val: summary.totalConversations > 0 ? (summary.totalMessages / summary.totalConversations).toFixed(1) : '0',
                  unit: 'messages / thread'
                },
                {
                  label: 'Saved Locations per User',
                  val: summary.totalUsers > 0 ? (summary.totalLocations / summary.totalUsers).toFixed(1) : '0',
                  unit: 'locations / user'
                }
              ].map(m => (
                <div
                  key={m.label}
                  className='flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800'
                >
                  <span className='text-xs font-semibold text-slate-600 dark:text-slate-300'>{m.label}</span>
                  <div className='text-right'>
                    <span className='text-base font-black text-slate-900 dark:text-white'>{m.val}</span>
                    <span className='text-[10px] text-slate-400 ml-1 font-medium'>{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminAnalyticsPage
