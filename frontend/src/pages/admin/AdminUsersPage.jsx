import React, { useState, useEffect, useCallback } from 'react'
import { useWeather } from '../../context/WeatherContext'
import { api } from '../../services/api'
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  KeyRound,
  UserCog,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
  Filter
} from 'lucide-react'

const ROLES = ['user', 'farmer', 'authority', 'admin']

const roleLabel = role => ({ user: 'Citizen', farmer: 'Farmer', authority: 'Authority', admin: 'Admin' }[role] ?? role)

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    authority: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    farmer: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    user: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[role] ?? styles.user}`}>
      {roleLabel(role)}
    </span>
  )
}

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, danger = true }) => {
  if (!isOpen) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
      <div className='bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm mx-4 space-y-4'>
        <div className='flex items-start gap-3'>
          {danger ? (
            <div className='w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0'>
              <AlertTriangle className='w-5 h-5 text-red-600 dark:text-red-400' />
            </div>
          ) : (
            <div className='w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0'>
              <KeyRound className='w-5 h-5 text-amber-600 dark:text-amber-400' />
            </div>
          )}
          <div>
            <h3 className='text-sm font-bold text-slate-900 dark:text-white'>{title}</h3>
            <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed'>{message}</p>
          </div>
        </div>
        <div className='flex items-center gap-2 justify-end'>
          <button
            onClick={onCancel}
            className='px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

const RoleChangeDropdown = ({ userId, currentRole, onRoleChanged }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { addToast } = useWeather()

  const handleRoleChange = async newRole => {
    if (newRole === currentRole) { setIsOpen(false); return }
    setLoading(true)
    setIsOpen(false)
    try {
      await api.changeUserRole(userId, newRole)
      onRoleChanged(userId, newRole)
      addToast?.({ message: `Role changed to ${roleLabel(newRole)}`, type: 'success' })
    } catch (err) {
      addToast?.({ message: err.message || 'Failed to change role', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className='flex items-center gap-1.5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition'
        title='Change role'
        aria-label='Change user role'
      >
        {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <UserCog className='w-4 h-4' />}
      </button>
      {isOpen && (
        <div className='absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 w-36 py-1 overflow-hidden'>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition flex items-center gap-2 ${
                r === currentRole
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {r === currentRole && <CheckCircle2 className='w-3 h-3 shrink-0' />}
              {roleLabel(r)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export const AdminUsersPage = () => {
  const { addToast, user: adminUser } = useWeather()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)

  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, userId: null, userName: '' })
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.listAdminUsers({ page, limit: 20, search, role: roleFilter })
      setUsers(data.users || [])
      setPagination(data.pagination || null)
    } catch (err) {
      addToast?.({ message: err.message || 'Failed to load users', type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [page, search, roleFilter])

  useEffect(() => {
    const timer = setTimeout(fetchUsers, search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  const handleRoleChanged = (userId, newRole) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u))
  }

  const openDeleteConfirm = (userId, userName) => {
    setConfirmModal({ open: true, type: 'delete', userId, userName })
  }

  const openResetConfirm = (userId, userName) => {
    setConfirmModal({ open: true, type: 'reset', userId, userName })
  }

  const handleConfirm = async () => {
    const { type, userId } = confirmModal
    setConfirmModal({ open: false })
    setActionLoading(userId)
    try {
      if (type === 'delete') {
        await api.deleteUserByAdmin(userId)
        setUsers(prev => prev.filter(u => u._id !== userId))
        addToast?.({ message: 'User deleted successfully', type: 'success' })
      } else if (type === 'reset') {
        await api.resetUserPasswordByAdmin(userId)
        addToast?.({ message: 'Password reset email sent', type: 'success' })
      }
    } catch (err) {
      addToast?.({ message: err.message || 'Action failed', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = iso => iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className='space-y-5 p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-slate-900 dark:text-white'>User Management</h1>
        <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>
          View, search, change roles, reset passwords, and delete user accounts
        </p>
      </div>

      {/* Controls */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <input
            type='text'
            placeholder='Search by name or email...'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className='w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-slate-900 dark:text-white placeholder-slate-400 transition'
          />
        </div>
        <div className='relative'>
          <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400' />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
            className='pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition appearance-none cursor-pointer'
          >
            <option value=''>All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40'>
                <th className='text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>User</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Role</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Joined</th>
                <th className='text-left px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Verified</th>
                <th className='text-right px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className='px-4 py-3'>
                      <div className='h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse' />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-4 py-12 text-center text-sm text-slate-400'>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const isSelf = u._id === adminUser?._id
                  const isActioning = actionLoading === u._id
                  return (
                    <tr key={u._id} className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition ${isSelf ? 'bg-blue-50/30 dark:bg-blue-950/10' : ''}`}>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2.5'>
                          <div className='w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0'>
                            {u.name?.slice(0, 2).toUpperCase() || 'U?'}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[160px]'>
                              {u.name}
                              {isSelf && <span className='ml-1.5 text-[10px] text-blue-500 font-bold'>(You)</span>}
                            </p>
                            <p className='text-xs text-slate-400 dark:text-slate-500 truncate max-w-[160px]'>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <RoleBadge role={u.role} />
                      </td>
                      <td className='px-4 py-3 text-xs text-slate-500 dark:text-slate-400'>{formatDate(u.createdAt)}</td>
                      <td className='px-4 py-3'>
                        {u.isVerified
                          ? <CheckCircle2 className='w-4 h-4 text-emerald-500' />
                          : <X className='w-4 h-4 text-slate-300 dark:text-slate-600' />}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center justify-end gap-1'>
                          {isActioning ? (
                            <Loader2 className='w-4 h-4 animate-spin text-slate-400' />
                          ) : (
                            <>
                              <RoleChangeDropdown
                                userId={u._id}
                                currentRole={u.role}
                                onRoleChanged={handleRoleChanged}
                              />
                              <button
                                onClick={() => openResetConfirm(u._id, u.name)}
                                className='p-1.5 rounded-lg text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition'
                                title='Send password reset email'
                                aria-label='Reset password'
                              >
                                <KeyRound className='w-4 h-4' />
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => openDeleteConfirm(u._id, u.name)}
                                  className='p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition'
                                  title='Delete user'
                                  aria-label='Delete user'
                                >
                                  <Trash2 className='w-4 h-4' />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800/60'>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()} users
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition'
                aria-label='Previous page'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='px-2 text-xs font-semibold text-slate-700 dark:text-slate-300'>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNext}
                className='p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition'
                aria-label='Next page'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        danger={confirmModal.type === 'delete'}
        title={confirmModal.type === 'delete' ? 'Delete User Account' : 'Send Password Reset'}
        message={
          confirmModal.type === 'delete'
            ? `This will permanently delete "${confirmModal.userName}" and all their data (conversations, locations, notifications). This cannot be undone.`
            : `A password reset link will be emailed to "${confirmModal.userName}". The link expires in 1 hour.`
        }
        onConfirm={handleConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </div>
  )
}

export default AdminUsersPage
