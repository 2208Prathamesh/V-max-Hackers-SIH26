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
  Filter,
  RefreshCw,
  Mail,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react'

const ROLES = ['user', 'farmer', 'authority', 'admin']
const roleLabel = r => ({ user: 'Citizen', farmer: 'Farmer', authority: 'Authority', admin: 'Admin' }[r] ?? r)

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

const AuthProviderBadge = ({ provider }) => {
  const map = {
    local: { label: 'Password', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' },
    google: { label: 'Google', cls: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' },
    microsoft: { label: 'Microsoft', cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400' },
    apple: { label: 'Apple', cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300' }
  }
  const cfg = map[provider] ?? map.local
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.cls}`}>{cfg.label}</span>
  )
}

// ---------------------------------------------------------------------------
// High-Visibility Critical Action Warning Modal
// ---------------------------------------------------------------------------
const CriticalActionModal = ({ isOpen, action, onConfirm, onCancel, loading }) => {
  if (!isOpen || !action) return null
  const { type, user, newRole } = action

  const isDelete = type === 'delete'
  const isReset = type === 'reset'
  const isRole = type === 'role'

  const getRoleWarning = (target) => {
    if (target === 'admin') {
      return {
        level: 'CRITICAL PRIVILEGE ESCALATION',
        badge: 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300',
        text: 'This user will be granted full administrative access. They will be able to delete accounts, alter roles, toggle system maintenance mode, and inspect raw database records.',
        danger: true
      }
    }
    if (target === 'authority') {
      return {
        level: 'HIGH AUTHORIZATION WARNING',
        badge: 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-300',
        text: 'This user will be authorized to publish emergency disaster warnings, severe weather alerts, and public broadcast bulletins to all citizens and farmers.',
        danger: true
      }
    }
    if (target === 'farmer') {
      return {
        level: 'ROLE ASSIGNMENT NOTICE',
        badge: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300',
        text: 'User profile will be configured with specialized agricultural advisories, crop calendar engines, and soil telemetry tools.',
        danger: false
      }
    }
    return {
      level: 'ACCESS PRIVILEGE REVOCATION',
      badge: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300',
      text: 'User will be reverted to standard citizen access. Any previous administrative or authority broadcast permissions will be immediately revoked.',
      danger: false
    }
  }

  const roleWarning = isRole ? getRoleWarning(newRole) : null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-5'>
        
        {/* Header with Danger/Warning Icon */}
        <div className='flex items-start gap-3.5'>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            isDelete ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400' :
            isRole && roleWarning?.danger ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400' :
            'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            {isDelete ? <ShieldAlert className='w-6 h-6' /> :
             isReset ? <KeyRound className='w-6 h-6' /> :
             <AlertTriangle className='w-6 h-6' />}
          </div>

          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1 ${
              isDelete ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
              isRole && roleWarning?.danger ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
              'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {isDelete ? 'Critical Destructive Action' : isReset ? 'Security Session Invalidation' : roleWarning?.level}
            </span>
            <h3 className='text-base font-black text-slate-900 dark:text-white'>
              {isDelete ? 'Permanently Delete User Account?' :
               isReset ? 'Reset User Password & Invalidate Sessions?' :
               'Confirm User Role Change'}
            </h3>
          </div>
        </div>

        {/* Affected User Profile Card */}
        <div className='p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-slate-400 font-semibold'>Target User:</span>
            <span className='font-bold text-slate-900 dark:text-white'>{user?.name}</span>
          </div>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-slate-400 font-semibold'>Email Address:</span>
            <span className='font-mono text-[11px] text-slate-700 dark:text-slate-300'>{user?.email}</span>
          </div>
          {isRole && (
            <div className='flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700/60'>
              <span className='text-slate-400 font-semibold'>Role Transition:</span>
              <div className='flex items-center gap-1.5'>
                <RoleBadge role={user?.role} />
                <ArrowRight className='w-3 h-3 text-slate-400' />
                <RoleBadge role={newRole} />
              </div>
            </div>
          )}
        </div>

        {/* Detailed Warning Notice */}
        <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
          isDelete
            ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300'
            : isReset
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
            : roleWarning?.danger
            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/40 text-purple-800 dark:text-purple-300'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}>
          {isDelete && (
            <p className='font-medium'>
              <strong className='font-bold block mb-1'>WARNING: This action is permanent and cannot be undone.</strong>
              All saved geographical coordinates, AI chat transcripts, and notification histories will be immediately eradicated from the primary database cluster.
            </p>
          )}

          {isReset && (
            <p className='font-medium'>
              <strong className='font-bold block mb-1'>Security Impact:</strong>
              Executing this will immediately invalidate all active JWT tokens for this account across all devices. A cryptographically generated password reset link will be dispatched to <strong>{user?.email}</strong>.
            </p>
          )}

          {isRole && (
            <p className='font-medium'>
              <strong className='font-bold block mb-1'>Security Consequence:</strong>
              {roleWarning?.text}
            </p>
          )}
        </div>

        {/* Modal Actions */}
        <div className='flex items-center gap-3 justify-end pt-1'>
          <button
            onClick={onCancel}
            disabled={loading}
            className='px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50 ${
              isDelete
                ? 'bg-red-600 hover:bg-red-700'
                : isRole && roleWarning?.danger
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
            <span>
              {isDelete ? 'Permanently Delete User' :
               isReset ? 'Proceed with Reset' :
               'Confirm Role Change'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Admin Direct Password Change Modal
// ---------------------------------------------------------------------------
const AdminPasswordModal = ({ isOpen, user, onSave, onCancel, loading }) => {
  const [mode, setMode] = useState('direct') // 'direct' | 'link'
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [notifyUser, setNotifyUser] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setMode('direct')
      setNewPassword('')
      setShowPassword(false)
      setNotifyUser(true)
    }
  }, [isOpen])

  if (!isOpen || !user) return null

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*'
    let pwd = ''
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setNewPassword(pwd)
    setShowPassword(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'direct' && newPassword.length < 6) return
    onSave({
      userId: user._id,
      newPassword: mode === 'direct' ? newPassword : null,
      notifyUser,
      mode
    })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md space-y-5'>
        
        {/* Header */}
        <div className='flex items-start gap-3.5'>
          <div className='w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0'>
            <KeyRound className='w-6 h-6' />
          </div>
          <div>
            <span className='inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1 bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'>
              Security Credential Control
            </span>
            <h3 className='text-base font-black text-slate-900 dark:text-white'>
              Change User Password
            </h3>
          </div>
        </div>

        {/* User Card */}
        <div className='p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-slate-400 font-semibold'>Target User:</span>
            <span className='font-bold text-slate-900 dark:text-white'>{user.name}</span>
          </div>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-slate-400 font-semibold'>Email Address:</span>
            <span className='font-mono text-[11px] text-slate-700 dark:text-slate-300'>{user.email}</span>
          </div>
          <div className='flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 dark:border-slate-700/60'>
            <span className='text-slate-400 font-semibold'>Assigned Role:</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Security Note on Existing Password */}
        <div className='p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1.5'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-slate-500 dark:text-slate-400 font-semibold'>Current Password:</span>
            <span className='font-mono tracking-widest text-slate-400 dark:text-slate-500 font-bold select-none'>••••••••••••</span>
          </div>
          <p className='text-[10px] text-slate-400 dark:text-slate-500 leading-tight'>
            🔒 <strong>Existing passwords cannot be viewed:</strong> For security & zero-knowledge compliance, passwords are encrypted via one-way bcrypt hashing. Only a new password can be directly provisioned.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className='flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl'>
          <button
            type='button'
            onClick={() => setMode('direct')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'direct'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Direct Password Set
          </button>
          <button
            type='button'
            onClick={() => setMode('link')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              mode === 'link'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Send Reset Link
          </button>
        </div>

        {/* Form Body */}
        {mode === 'direct' ? (
          <form onSubmit={handleSubmit} className='space-y-3.5'>
            <div>
              <div className='flex items-center justify-between mb-1.5'>
                <label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                  New Password (min 6 chars)
                </label>
                <button
                  type='button'
                  onClick={handleGeneratePassword}
                  className='flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
                >
                  <Sparkles className='w-3 h-3' />
                  <span>Generate Strong</span>
                </button>
              </div>

              <div className='relative'>
                <Lock className='w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2' />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder='Enter new password for user'
                  className='w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5'
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                </button>
              </div>
            </div>

            {/* Email Notification Checkbox */}
            <label className='flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 cursor-pointer'>
              <input
                type='checkbox'
                checked={notifyUser}
                onChange={e => setNotifyUser(e.target.checked)}
                className='mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer'
              />
              <div className='text-xs'>
                <span className='font-bold text-blue-950 dark:text-blue-200 block'>
                  Notify user via official email
                </span>
                <span className='text-[11px] text-blue-700 dark:text-blue-300 leading-tight block mt-0.5'>
                  Dispatches an automated security notification to <strong>{user.email}</strong> alerting them that their password was updated.
                </span>
              </div>
            </label>

            {/* Buttons */}
            <div className='flex items-center gap-3 justify-end pt-2'>
              <button
                type='button'
                onClick={onCancel}
                disabled={loading}
                className='px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={loading || newPassword.length < 6}
                className='flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50'
              >
                {loading && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
                <span>Set Password & Notify</span>
              </button>
            </div>
          </form>
        ) : (
          <div className='space-y-4'>
            <p className='text-xs text-slate-600 dark:text-slate-300 leading-relaxed'>
              Generating a password reset link will invalidate all active sessions and dispatch an authorized reset token to <strong>{user.email}</strong>, allowing the user to create a new password themselves.
            </p>

            <div className='flex items-center gap-3 justify-end pt-2'>
              <button
                type='button'
                onClick={onCancel}
                disabled={loading}
                className='px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSubmit}
                disabled={loading}
                className='flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50'
              >
                {loading && <Loader2 className='w-3.5 h-3.5 animate-spin' />}
                <span>Send Reset Link via Email</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Password Reset Result Success Modal
// ---------------------------------------------------------------------------
const ResetResultModal = ({ isOpen, token, newPassword, email, directChange, onClose }) => {
  const [copied, setCopied] = useState(false)
  if (!isOpen) return null

  const handleCopy = () => {
    const textToCopy = directChange ? newPassword : token
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm space-y-4 text-center'>
        <div className='w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto'>
          <CheckCircle2 className='w-6 h-6' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-slate-900 dark:text-white'>
            {directChange ? 'Password Changed Successfully' : 'Password Reset Link Generated'}
          </h3>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            {directChange
              ? <>Password has been directly updated and an official notification email was dispatched to <strong>{email}</strong>.</>
              : <>A secure reset token has been registered and dispatched to <strong>{email}</strong>.</>}
          </p>
        </div>

        {(directChange ? newPassword : token) && (
          <div className='p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-1.5'>
            <div className='flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase'>
              <span>{directChange ? 'New Assigned Password' : 'Reset Token'}</span>
              <button
                onClick={handleCopy}
                className='flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer'
              >
                {copied ? <Check className='w-3 h-3 text-emerald-500' /> : <Copy className='w-3 h-3' />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className='font-mono text-xs font-bold break-all text-slate-800 dark:text-slate-200 select-all'>
              {directChange ? newPassword : token}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className='w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer'
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Role Change Dropdown (Calls Modal before firing API)
// ---------------------------------------------------------------------------
const RoleChangeDropdown = ({ user, onRequestRoleChange }) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelectRole = (newRole) => {
    setIsOpen(false)
    if (newRole !== user.role) {
      onRequestRoleChange(user, newRole)
    }
  }

  return (
    <div className='relative'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-1.5 p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer'
        title='Change user role'
        aria-label='Change user role'
      >
        <UserCog className='w-4 h-4' />
      </button>
      {isOpen && (
        <div className='absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 w-40 py-1 overflow-hidden'>
          <div className='px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800'>
            Assign New Role
          </div>
          {ROLES.map(r => (
            <button
              key={r}
              onClick={() => handleSelectRole(r)}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                r === user.role
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{roleLabel(r)}</span>
              {r === user.role && <CheckCircle2 className='w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400' />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Inline expandable user detail panel
// ---------------------------------------------------------------------------
const UserDetailPanel = ({ user: u, onClose }) => {
  const formatDate = iso => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
  const fields = [
    { label: 'User ID', value: u._id, mono: true },
    { label: 'Email', value: u.email },
    { label: 'Role', value: roleLabel(u.role) },
    { label: 'Auth Provider', value: u.authProvider || 'local' },
    { label: 'Language', value: u.language || 'en' },
    { label: 'Timezone', value: u.timezone || '—' },
    { label: 'Email Verified', value: u.isVerified ? 'Yes' : 'No' },
    { label: 'Registered', value: formatDate(u.createdAt) },
    { label: 'Last Updated', value: formatDate(u.updatedAt) }
  ]
  return (
    <div className='border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-800/30 px-5 py-4'>
      <div className='flex items-center justify-between mb-3'>
        <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>Full User Record</span>
        <button onClick={onClose} className='p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer'>
          <X className='w-3.5 h-3.5 text-slate-400' />
        </button>
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2.5'>
        {fields.map(f => (
          <div key={f.label}>
            <p className='text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide'>{f.label}</p>
            <p className={`text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 truncate ${f.mono ? 'font-mono text-[11px]' : ''}`}>{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Admin Users Page Component
// ---------------------------------------------------------------------------
export const AdminUsersPage = () => {
  const { addToast } = useWeather()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  // Critical Action Warning Modal State
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    action: null // { type: 'role'|'reset'|'delete', user, newRole }
  })
  const [actionLoading, setActionLoading] = useState(false)

  // Direct Password Change Modal State
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, user: null })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Reset Result Success Modal
  const [resetResult, setResetResult] = useState({
    isOpen: false,
    token: null,
    newPassword: null,
    email: null,
    directChange: false
  })

  const fetchUsers = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const data = await api.listAdminUsers({ page, limit: 20, search, role: roleFilter })
      setUsers(data.users || [])
      setPagination(data.pagination || null)
    } catch (err) {
      addToast?.(err.message || 'Failed to load users', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, search, roleFilter, addToast])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(false), search ? 400 : 0)
    return () => clearTimeout(timer)
  }, [fetchUsers])

  // Silent auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchUsers(true), 30000)
    return () => clearInterval(interval)
  }, [fetchUsers])

  // Triggers the Warning Modal before changing role
  const handleRequestRoleChange = (user, targetRole) => {
    setActionModal({
      isOpen: true,
      action: { type: 'role', user, newRole: targetRole }
    })
  }

  // Triggers the Direct Password Change / Reset Modal
  const handleRequestPasswordReset = (user) => {
    setPasswordModal({
      isOpen: true,
      user
    })
  }

  // Handle direct password change or reset link dispatch
  const handleConfirmPasswordChange = async ({ userId, newPassword, notifyUser, mode }) => {
    setPasswordLoading(true)
    const targetUser = passwordModal.user
    try {
      if (mode === 'direct') {
        await api.resetUserPasswordByAdmin(userId, { newPassword, notifyUser })
        setPasswordModal({ isOpen: false, user: null })
        setResetResult({
          isOpen: true,
          newPassword,
          token: null,
          email: targetUser?.email,
          directChange: true
        })
        addToast?.(`Password directly changed for ${targetUser?.name} and notification email dispatched`, 'success')
      } else {
        const res = await api.resetUserPasswordByAdmin(userId, { notifyUser: true })
        setPasswordModal({ isOpen: false, user: null })
        setResetResult({
          isOpen: true,
          token: res?.temporaryToken || 'SECURE_RESET_LINK_DISPATCHED',
          newPassword: null,
          email: targetUser?.email,
          directChange: false
        })
        addToast?.(`Password reset link dispatched to ${targetUser?.email}`, 'success')
      }
    } catch (err) {
      addToast?.(err.message || 'Password update failed', 'error')
    } finally {
      setPasswordLoading(false)
    }
  }

  // Triggers the Warning Modal before deleting user
  const handleRequestDelete = (user) => {
    setActionModal({
      isOpen: true,
      action: { type: 'delete', user }
    })
  }

  // Execute confirmed critical action
  const handleExecuteConfirmedAction = async () => {
    if (!actionModal.action) return
    const { type, user, newRole } = actionModal.action
    setActionLoading(true)

    try {
      if (type === 'role') {
        await api.changeUserRole(user._id, newRole)
        setUsers(prev => prev.map(u => u._id === user._id ? { ...u, role: newRole } : u))
        addToast?.(`Role changed to ${roleLabel(newRole)} for ${user.name}`, 'success')
        setActionModal({ isOpen: false, action: null })
      } else if (type === 'reset') {
        const res = await api.resetUserPasswordByAdmin(user._id)
        setActionModal({ isOpen: false, action: null })
        setResetResult({
          isOpen: true,
          token: res?.temporaryToken || 'SECURE_RESET_LINK_DISPATCHED',
          newPassword: null,
          email: user.email,
          directChange: false
        })
        addToast?.(`Password reset dispatched to ${user.email}`, 'success')
      } else if (type === 'delete') {
        await api.deleteUserByAdmin(user._id)
        setUsers(prev => prev.filter(u => u._id !== user._id))
        addToast?.(`User ${user.name} permanently deleted`, 'success')
        setActionModal({ isOpen: false, action: null })
      }
    } catch (err) {
      addToast?.(err.message || 'Critical action failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const totalShowing = pagination
    ? `Showing ${((pagination.page - 1) * pagination.limit) + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total.toLocaleString()} users`
    : ''

  return (
    <div className='space-y-6 p-6 max-w-7xl mx-auto'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-3'>
            <h1 className='text-2xl font-black text-slate-900 dark:text-white tracking-tight'>
              User Directory & Access Control
            </h1>
            <span className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'>
              <ShieldCheck className='w-3 h-3' />
              RBAC Guard Active
            </span>
          </div>
          <p className='text-xs text-slate-500 dark:text-slate-400 mt-1'>
            Manage platform identity, authorization privileges, security credentials, and role escalation
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={loading || refreshing}
          className='self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs disabled:opacity-50 cursor-pointer'
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          <span>{refreshing ? 'Syncing...' : 'Sync Directory'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1'>
          <Search className='w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none' />
          <input
            type='text'
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder='Search users by name, email, or credentials...'
            className='w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-xs'
          />
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <Filter className='w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none' />
            <select
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
              className='pl-8 pr-8 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs focus:outline-none cursor-pointer'
            >
              <option value=''>All Roles</option>
              {ROLES.map(r => (
                <option key={r} value={r}>{roleLabel(r)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-xs'>
        <div className='overflow-x-auto'>
          <table className='w-full text-xs'>
            <thead className='bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800'>
              <tr>
                <th className='text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>User Profile</th>
                <th className='text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Role</th>
                <th className='text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Authentication</th>
                <th className='text-left px-5 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Registered</th>
                <th className='text-right px-5 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider'>Security Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td colSpan={5} className='px-5 py-4'>
                      <div className='h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse' />
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-5 py-12 text-center text-slate-400'>
                    No user accounts found matching your query
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <React.Fragment key={u._id}>
                    <tr
                      onClick={() => setExpandedRow(expandedRow === u._id ? null : u._id)}
                      className='hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition cursor-pointer group'
                    >
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-xs shrink-0'>
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className='min-w-0'>
                            <p className='font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition'>
                              {u.name}
                            </p>
                            <p className='text-slate-400 font-mono text-[11px] truncate flex items-center gap-1'>
                              <Mail className='w-3 h-3' />
                              <span>{u.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className='px-5 py-3.5'>
                        <RoleBadge role={u.role} />
                      </td>

                      <td className='px-5 py-3.5'>
                        <AuthProviderBadge provider={u.authProvider} />
                      </td>

                      <td className='px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]'>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>

                      <td
                        className='px-5 py-3.5 text-right'
                        onClick={e => e.stopPropagation()}
                      >
                        <div className='flex items-center justify-end gap-1.5'>
                          {/* Role Change with Warning Popup */}
                          <RoleChangeDropdown
                            user={u}
                            onRequestRoleChange={handleRequestRoleChange}
                          />

                          {/* Reset Password with Warning Popup */}
                          <button
                            onClick={() => handleRequestPasswordReset(u)}
                            className='p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition cursor-pointer'
                            title='Reset user password & invalidate sessions'
                            aria-label='Reset password'
                          >
                            <KeyRound className='w-4 h-4' />
                          </button>

                          {/* Delete Account with Warning Popup */}
                          <button
                            onClick={() => handleRequestDelete(u)}
                            className='p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer'
                            title='Permanently delete user account'
                            aria-label='Delete account'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable row detail panel */}
                    {expandedRow === u._id && (
                      <tr>
                        <td colSpan={5} className='p-0'>
                          <UserDetailPanel
                            user={u}
                            onClose={() => setExpandedRow(null)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'>
            <span className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
              {totalShowing}
            </span>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrev}
                className='p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              <span className='text-xs font-bold text-slate-700 dark:text-slate-200 px-2'>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasNext}
                className='p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-30 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Direct Password Change Modal */}
      <AdminPasswordModal
        isOpen={passwordModal.isOpen}
        user={passwordModal.user}
        onSave={handleConfirmPasswordChange}
        onCancel={() => setPasswordModal({ isOpen: false, user: null })}
        loading={passwordLoading}
      />

      {/* Critical Action Warning Modal */}
      <CriticalActionModal
        isOpen={actionModal.isOpen}
        action={actionModal.action}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setActionModal({ isOpen: false, action: null })}
        loading={actionLoading}
      />

      {/* Password Reset / Change Result Success Modal */}
      <ResetResultModal
        isOpen={resetResult.isOpen}
        token={resetResult.token}
        newPassword={resetResult.newPassword}
        email={resetResult.email}
        directChange={resetResult.directChange}
        onClose={() => setResetResult({ isOpen: false, token: null, newPassword: null, email: null, directChange: false })}
      />
    </div>
  )
}

export default AdminUsersPage
