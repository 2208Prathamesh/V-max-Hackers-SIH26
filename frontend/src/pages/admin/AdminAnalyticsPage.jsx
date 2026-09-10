import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import {
  TrendingUp,
  Users,
  MessageSquare,
  BarChart2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

const BarRow = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className='space-y-1'>
      <div className='flex items-center justify-between text-xs'>
        <span className='font-medium text-slate-600 dark:text-slate-300'>{label}</span>
        <span className='font-bold text-slate-800 dark:text-slate-100'>{value.toLocaleString()} <span className='text-slate-400 font-normal'>({pct}%)</span></span>
      </div>
      <div className='h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color, bg, border }) => (
  <div className={`p-5 rounded-2xl border ${border} ${bg} space-y-3`}>
    <div className='flex items-center justify-between'>
      <span className='text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>{label}</span>
      <div className='w-8 h-8 rounded-xl flex items-center justify-center bg-white/60 dark:bg-white/5'>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <p className='text-3xl font-bold text-slate-900 dark:text-white'>
      {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
    </p>
  </div>
)

export const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const result = await api.getAdminAnalytics()
      setData(result)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const summary = data?.summary
  const roleCounts = summary?.roleCounts || {}
  const roleOrder = [
    { key: 'user', label: 'Citizens', color: 'bg-slate-400' },
    { key: 'farmer', label: 'Farmers', color: 'bg-emerald-500' },
    { key: 'authority', label: 'Authority Officers', color: 'bg-blue-500' },
    { key: 'admin', label: 'Administrators', color: 'bg-purple-500' }
  ]
  const maxRole = Math.max(...roleOrder.map(r => roleCounts[r.key] || 0), 1)

  return (
    <div className='space-y-6 p-6 max-w-7xl mx-auto'>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>Platform Analytics</h1>
          <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
            Live platform usage and user distribution data
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
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
          <span>{error}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[1, 2, 3].map(i => <div key={i} className='h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse' />)}
        </div>
      ) : summary && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <StatCard
            label='Total Registered Users'
            value={summary.totalUsers}
            icon={Users}
            color='text-blue-600 dark:text-blue-400'
            bg='bg-blue-50 dark:bg-blue-950/30'
            border='border-blue-100 dark:border-blue-900/30'
          />
          <StatCard
            label='AI Conversations'
            value={summary.totalConversations}
            icon={MessageSquare}
            color='text-violet-600 dark:text-violet-400'
            bg='bg-violet-50 dark:bg-violet-950/30'
            border='border-violet-100 dark:border-violet-900/30'
          />
          <StatCard
            label='Total AI Messages'
            value={summary.totalMessages}
            icon={TrendingUp}
            color='text-emerald-600 dark:text-emerald-400'
            bg='bg-emerald-50 dark:bg-emerald-950/30'
            border='border-emerald-100 dark:border-emerald-900/30'
          />
        </div>
      )}

      {/* Role Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-5'>
          <div className='flex items-center gap-2'>
            <BarChart2 className='w-4 h-4 text-slate-400' />
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>User Role Distribution</h2>
          </div>
          {loading ? (
            <div className='space-y-4'>
              {[1, 2, 3, 4].map(i => <div key={i} className='h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />)}
            </div>
          ) : (
            <div className='space-y-4'>
              {roleOrder.map(r => (
                <BarRow
                  key={r.key}
                  label={r.label}
                  value={roleCounts[r.key] || 0}
                  max={maxRole}
                  color={r.color}
                />
              ))}
            </div>
          )}
        </div>

        {/* Usage Breakdown */}
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 space-y-5'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4 text-slate-400' />
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Engagement Metrics</h2>
          </div>
          {loading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map(i => <div key={i} className='h-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />)}
            </div>
          ) : summary && (
            <div className='space-y-3'>
              {[
                {
                  label: 'Avg Conversations per User',
                  value: summary.totalUsers > 0 ? (summary.totalConversations / summary.totalUsers).toFixed(1) : '0',
                  unit: 'conversations'
                },
                {
                  label: 'Avg Messages per Conversation',
                  value: summary.totalConversations > 0 ? (summary.totalMessages / summary.totalConversations).toFixed(1) : '0',
                  unit: 'messages'
                },
                {
                  label: 'Avg Messages per User',
                  value: summary.totalUsers > 0 ? (summary.totalMessages / summary.totalUsers).toFixed(1) : '0',
                  unit: 'messages'
                }
              ].map(metric => (
                <div key={metric.label} className='flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800'>
                  <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>{metric.label}</span>
                  <div className='text-right'>
                    <span className='text-lg font-bold text-slate-900 dark:text-white'>{metric.value}</span>
                    <span className='text-xs text-slate-400 ml-1'>{metric.unit}</span>
                  </div>
                </div>
              ))}

              {/* Role summary table */}
              <div className='pt-2 border-t border-slate-100 dark:border-slate-800/60'>
                <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2'>By Role</p>
                <div className='space-y-1'>
                  {roleOrder.map(r => (
                    <div key={r.key} className='flex items-center justify-between text-xs py-1'>
                      <div className='flex items-center gap-2'>
                        <span className={`w-2 h-2 rounded-full ${r.color}`} />
                        <span className='text-slate-600 dark:text-slate-300'>{r.label}</span>
                      </div>
                      <span className='font-bold text-slate-800 dark:text-slate-100'>{(roleCounts[r.key] || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Registrations Table */}
      {!loading && data?.recentUsers?.length > 0 && (
        <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden'>
          <div className='px-5 py-4 border-b border-slate-100 dark:border-slate-800/60'>
            <h2 className='text-sm font-bold text-slate-800 dark:text-slate-100'>Recent Registrations (Last 10)</h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full text-xs'>
              <thead className='bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60'>
                <tr>
                  <th className='text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>User</th>
                  <th className='text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Role</th>
                  <th className='text-left px-4 py-2.5 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Joined</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {data.recentUsers.map(u => (
                  <tr key={u._id} className='hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition'>
                    <td className='px-4 py-3'>
                      <div>
                        <p className='font-semibold text-slate-800 dark:text-slate-100'>{u.name}</p>
                        <p className='text-slate-400 dark:text-slate-500'>{u.email}</p>
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                        u.role === 'authority' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                        u.role === 'farmer' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {{ user: 'Citizen', farmer: 'Farmer', authority: 'Authority', admin: 'Admin' }[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-slate-500 dark:text-slate-400'>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminAnalyticsPage
