import React, { useState, useEffect } from 'react'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'
import {
  Users,
  AlertTriangle,
  MessageSquare,
  Activity,
  Server,
  Database,
  Cpu,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Shield,
  TrendingUp,
  UserCheck,
  Zap
} from 'lucide-react'

const StatusDot = ({ status }) => {
  const map = {
    healthy: 'bg-emerald-500',
    operational: 'bg-emerald-500',
    degraded: 'bg-amber-400',
    connecting: 'bg-amber-400',
    error: 'bg-red-500',
    disabled: 'bg-slate-400',
    unknown: 'bg-slate-400'
  }
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${map[status] ?? 'bg-slate-400'} shadow-sm`} />
  )
}

const RoleBadge = ({ role }) => {
  const map = {
    admin: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    authority: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    farmer: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    user: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
  const labels = { admin: 'Admin', authority: 'Authority', farmer: 'Farmer', user: 'Citizen' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${map[role] ?? map.user}`}>
      {labels[role] ?? role}
    </span>
  )
}

export const AdminDashboardPage = () => {
  const { user, setCurrentPage } = useWeather()
  const [analytics, setAnalytics] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [analyticsData, healthData] = await Promise.all([
          api.getAdminAnalytics(),
          api.getSystemHealth()
        ])
        if (mounted) {
          setAnalytics(analyticsData)
          setHealth(healthData)
        }
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const summaryCards = analytics ? [
    {
      id: 'total-users',
      label: 'Total Users',
      value: analytics.summary?.totalUsers ?? '—',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    {
      id: 'total-conversations',
      label: 'AI Conversations',
      value: analytics.summary?.totalConversations ?? '—',
      icon: MessageSquare,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-950/40',
      border: 'border-violet-100 dark:border-violet-900/30'
    },
    {
      id: 'total-messages',
      label: 'Total AI Messages',
      value: analytics.summary?.totalMessages ?? '—',
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    {
      id: 'farmers',
      label: 'Registered Farmers',
      value: analytics.summary?.roleCounts?.farmer ?? '—',
      icon: UserCheck,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-100 dark:border-amber-900/30'
    }
  ] : []

  const services = health?.services
    ? [
        { name: 'API Server', status: health.services.api },
        { name: 'MongoDB', status: health.services.mongodb },
        { name: 'Redis Cache', status: health.services.redis }
      ]
    : []

  const quickActions = [
    { label: 'Manage Users', page: 'admin-users', icon: Users, desc: 'View, edit, and delete user accounts' },
    { label: 'Platform Analytics', page: 'admin-analytics', icon: TrendingUp, desc: 'Usage stats and role distribution' },
    { label: 'System Health', page: 'admin-system', icon: Server, desc: 'Uptime, memory, and service status' }
  ]

  return (
    <div className='space-y-6 p-6 max-w-7xl mx-auto'>
      {/* Page Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Admin Dashboard</h1>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Platform overview and system status — WeatherGPT Administration
          </p>
        </div>
        <div className='flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 rounded-xl'>
          <Shield className='w-4 h-4 text-purple-600 dark:text-purple-400' />
          <span className='text-xs font-bold text-purple-700 dark:text-purple-300'>Administrator</span>
        </div>
      </div>

      {error && (
        <div className='flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm text-red-700 dark:text-red-300'>
          <AlertTriangle className='w-4 h-4 shrink-0' />
          <span>Failed to load dashboard data: {error}. Ensure the backend admin API is running.</span>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse' />
          ))}
        </div>
      ) : (
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summaryCards.map(card => {
            const Icon = card.icon
            return (
              <div key={card.id} className={`p-4 rounded-2xl border ${card.border} ${card.bg} space-y-2`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div>
                  <p className='text-2xl font-bold text-slate-900 dark:text-white'>
                    {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                  </p>
                  <p className='text-xs font-medium text-slate-500 dark:text-slate-400'>{card.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* System Health */}
        <div className='lg:col-span-1 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>System Health</h2>
            <button
              onClick={() => setCurrentPage('admin-system')}
              className='text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1'
            >
              Details <ArrowRight className='w-3 h-3' />
            </button>
          </div>

          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map(i => <div key={i} className='h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse' />)}
            </div>
          ) : health ? (
            <div className='space-y-3'>
              {services.map(svc => (
                <div key={svc.name} className='flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 last:border-0'>
                  <span className='text-sm text-slate-700 dark:text-slate-300'>{svc.name}</span>
                  <div className='flex items-center gap-1.5'>
                    <StatusDot status={svc.status} />
                    <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize'>{svc.status}</span>
                  </div>
                </div>
              ))}
              <div className='pt-2 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400'>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5' />
                  <span className='font-medium'>Uptime:</span>
                </div>
                <span className='text-right font-semibold text-slate-700 dark:text-slate-200'>{health.uptime}</span>
                <div className='flex items-center gap-1.5'>
                  <Cpu className='w-3.5 h-3.5' />
                  <span className='font-medium'>Heap:</span>
                </div>
                <span className='text-right font-semibold text-slate-700 dark:text-slate-200'>{health.memory?.heapUsed}</span>
              </div>
            </div>
          ) : (
            <p className='text-sm text-slate-400'>Health data unavailable</p>
          )}
        </div>

        {/* User Role Distribution */}
        <div className='lg:col-span-1 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Role Distribution</h2>
            <button
              onClick={() => setCurrentPage('admin-analytics')}
              className='text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1'
            >
              Analytics <ArrowRight className='w-3 h-3' />
            </button>
          </div>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4].map(i => <div key={i} className='h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse' />)}
            </div>
          ) : analytics ? (
            <div className='space-y-2.5'>
              {[
                { role: 'user', label: 'Citizens', count: analytics.summary?.roleCounts?.user ?? 0 },
                { role: 'farmer', label: 'Farmers', count: analytics.summary?.roleCounts?.farmer ?? 0 },
                { role: 'authority', label: 'Authority Officers', count: analytics.summary?.roleCounts?.authority ?? 0 },
                { role: 'admin', label: 'Administrators', count: analytics.summary?.roleCounts?.admin ?? 0 }
              ].map(item => {
                const total = analytics.summary?.totalUsers || 1
                const pct = Math.round((item.count / total) * 100)
                return (
                  <div key={item.role} className='space-y-1'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='font-medium text-slate-600 dark:text-slate-300'>{item.label}</span>
                      <span className='font-bold text-slate-800 dark:text-slate-100'>{item.count.toLocaleString()} <span className='text-slate-400'>({pct}%)</span></span>
                    </div>
                    <div className='h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item.role === 'admin' ? 'bg-purple-500' :
                          item.role === 'authority' ? 'bg-blue-500' :
                          item.role === 'farmer' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-slate-400'>Analytics unavailable</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className='lg:col-span-1 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4'>
          <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Quick Actions</h2>
          <div className='space-y-2'>
            {quickActions.map(action => {
              const Icon = action.icon
              return (
                <button
                  key={action.page}
                  onClick={() => setCurrentPage(action.page)}
                  className='w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 transition-all text-left group'
                >
                  <div className='w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors'>
                    <Icon className='w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>{action.label}</p>
                    <p className='text-xs text-slate-400 dark:text-slate-500 truncate'>{action.desc}</p>
                  </div>
                  <ArrowRight className='w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors shrink-0' />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Users */}
      {!loading && analytics?.recentUsers?.length > 0 && (
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden'>
          <div className='flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/60'>
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Recent Registrations</h2>
            <button
              onClick={() => setCurrentPage('admin-users')}
              className='text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1'
            >
              View all <ArrowRight className='w-3 h-3' />
            </button>
          </div>
          <div className='divide-y divide-slate-100 dark:divide-slate-800/60'>
            {analytics.recentUsers.slice(0, 6).map(u => (
              <div key={u._id} className='flex items-center gap-3 px-5 py-3'>
                <div className='w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0'>
                  {u.name?.slice(0, 2).toUpperCase() || 'U?'}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-sm font-semibold text-slate-800 dark:text-slate-100 truncate'>{u.name}</p>
                  <p className='text-xs text-slate-400 dark:text-slate-500 truncate'>{u.email}</p>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardPage
