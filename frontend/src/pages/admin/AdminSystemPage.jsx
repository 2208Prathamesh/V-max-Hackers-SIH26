import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  Server,
  Database,
  Zap,
  Cpu,
  HardDrive,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Terminal,
  Layers
} from 'lucide-react'

const ServiceCard = ({ name, status, icon: Icon }) => {
  const statusConfig = {
    healthy: {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'Healthy',
      Icon: CheckCircle2,
      iconColor: 'text-emerald-500'
    },
    operational: {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      text: 'Operational',
      Icon: CheckCircle2,
      iconColor: 'text-emerald-500'
    },
    degraded: {
      dot: 'bg-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Degraded',
      Icon: AlertTriangle,
      iconColor: 'text-amber-500'
    },
    connecting: {
      dot: 'bg-amber-400',
      badge: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      text: 'Connecting',
      Icon: AlertTriangle,
      iconColor: 'text-amber-500'
    },
    error: {
      dot: 'bg-red-500',
      badge: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      text: 'Error',
      Icon: XCircle,
      iconColor: 'text-red-500'
    },
    disabled: {
      dot: 'bg-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      text: 'Disabled',
      Icon: XCircle,
      iconColor: 'text-slate-400'
    },
    unknown: {
      dot: 'bg-slate-400',
      badge: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      text: 'Unknown',
      Icon: AlertTriangle,
      iconColor: 'text-slate-400'
    }
  }

  const cfg = statusConfig[status] ?? statusConfig.unknown
  const StatusIcon = cfg.Icon

  return (
    <div className='flex items-center justify-between p-4 bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center'>
          <Icon className='w-5 h-5 text-slate-500 dark:text-slate-400' />
        </div>
        <div>
          <p className='text-sm font-semibold text-slate-800 dark:text-slate-100'>{name}</p>
          <div className='flex items-center gap-1.5 mt-0.5'>
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            <span className='text-xs text-slate-400'>{cfg.text}</span>
          </div>
        </div>
      </div>
      <StatusIcon className={`w-5 h-5 ${cfg.iconColor}`} />
    </div>
  )
}

const MemoryBar = ({ label, used, total }) => {
  const usedBytes = parseFloat(used) || 0
  const totalBytes = parseFloat(total) || 1
  const pct = Math.min(100, Math.round((usedBytes / totalBytes) * 100))
  const color = pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-400' : 'bg-emerald-500'
  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs'>
        <span className='font-medium text-slate-600 dark:text-slate-300'>{label}</span>
        <span className='font-bold text-slate-800 dark:text-slate-100'>{used} / {total} <span className='text-slate-400 font-normal'>({pct}%)</span></span>
      </div>
      <div className='h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export const AdminSystemPage = () => {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastRefreshed, setLastRefreshed] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const data = await api.getSystemHealth()
      setHealth(data)
      setLastRefreshed(new Date())
    } catch (err) {
      setError(err.message || 'Failed to reach backend health endpoint')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(() => load(true), 60000) // auto-refresh every 60s
    return () => clearInterval(interval)
  }, [])

  const services = health?.services
    ? [
        { name: 'API Server', status: health.services.api, icon: Server },
        { name: 'MongoDB Database', status: health.services.mongodb, icon: Database },
        { name: 'Redis Cache', status: health.services.redis, icon: Zap }
      ]
    : []

  const infoRows = health
    ? [
        { label: 'Status', value: health.status ?? '—', highlight: true },
        { label: 'Environment', value: health.environment ?? '—' },
        { label: 'Node.js Version', value: health.nodeVersion ?? '—' },
        { label: 'Process ID', value: String(health.pid ?? '—') },
        { label: 'System Uptime', value: health.uptime ?? '—' }
      ]
    : []

  return (
    <div className='space-y-6 p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>System Health</h1>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Live service status, memory usage, and runtime information
            {lastRefreshed && (
              <span className='ml-2 text-slate-400'>
                — Last updated: {lastRefreshed.toLocaleTimeString('en-IN')}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className='flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50'
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className='flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-sm text-red-700 dark:text-red-300'>
          <AlertTriangle className='w-4 h-4 shrink-0' />
          <span>{error} — The backend may be offline or the admin endpoint is unreachable.</span>
        </div>
      )}

      {/* Service Status */}
      <div>
        <h2 className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3'>Service Status</h2>
        {loading ? (
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {[1, 2, 3].map(i => <div key={i} className='h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse' />)}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
            {services.map(svc => <ServiceCard key={svc.name} {...svc} />)}
          </div>
        )}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Runtime Info */}
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <Terminal className='w-4 h-4 text-slate-400' />
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Runtime Information</h2>
          </div>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3, 4, 5].map(i => <div key={i} className='h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />)}
            </div>
          ) : (
            <div className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {infoRows.map(row => (
                <div key={row.label} className='flex items-center justify-between py-2.5'>
                  <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>{row.label}</span>
                  <span className={`text-xs font-bold ${row.highlight ? 'text-emerald-600 dark:text-emerald-400 capitalize' : 'text-slate-800 dark:text-slate-100'} font-mono`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memory Usage */}
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-4'>
          <div className='flex items-center gap-2'>
            <Cpu className='w-4 h-4 text-slate-400' />
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Memory Usage</h2>
          </div>
          {loading ? (
            <div className='space-y-5'>
              {[1, 2, 3].map(i => <div key={i} className='h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />)}
            </div>
          ) : health?.memory ? (
            <div className='space-y-5'>
              <MemoryBar
                label='Heap Used / Total'
                used={health.memory.heapUsed}
                total={health.memory.heapTotal}
              />
              <div className='space-y-2'>
                <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Detailed Breakdown</p>
                {[
                  { label: 'Heap Used', value: health.memory.heapUsed },
                  { label: 'Heap Total', value: health.memory.heapTotal },
                  { label: 'RSS (Resident Set)', value: health.memory.rss },
                  { label: 'External', value: health.memory.external }
                ].map(m => (
                  <div key={m.label} className='flex items-center justify-between py-1.5 text-xs border-b border-slate-100 dark:border-slate-800/60 last:border-0'>
                    <span className='text-slate-500 dark:text-slate-400'>{m.label}</span>
                    <span className='font-bold text-slate-800 dark:text-slate-100 font-mono'>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className='text-sm text-slate-400'>Memory data unavailable</p>
          )}
        </div>
      </div>

      {/* Overall Status Banner */}
      {!loading && health && (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
          health.services?.mongodb === 'healthy' && health.services?.api === 'healthy'
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
        }`}>
          <Activity className={`w-5 h-5 shrink-0 ${
            health.services?.mongodb === 'healthy' ? 'text-emerald-500' : 'text-amber-500'
          }`} />
          <div>
            <p className={`text-sm font-bold ${
              health.services?.mongodb === 'healthy'
                ? 'text-emerald-800 dark:text-emerald-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {health.services?.mongodb === 'healthy' && health.services?.api === 'healthy'
                ? 'All systems operational'
                : 'Some services require attention'}
            </p>
            <p className={`text-xs mt-0.5 ${
              health.services?.mongodb === 'healthy'
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}>
              WeatherGPT Backend — Uptime: {health.uptime} — {health.nodeVersion}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSystemPage
