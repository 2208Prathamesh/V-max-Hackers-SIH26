import React from 'react'
import {
  Wrench,
  ShieldAlert,
  Clock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Server,
  Activity
} from 'lucide-react'

export const MaintenancePage = ({ maintenance, onStaffAccess }) => {
  const title = maintenance?.title || 'Scheduled Platform Maintenance'
  const message = maintenance?.message || 'We are currently performing essential infrastructure upgrades and meteorological model sync. Normal operations will resume shortly.'
  const estimatedEnd = maintenance?.estimatedEnd
    ? new Date(maintenance.estimatedEnd).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST'
    : 'Shortly'

  const affectedServices = maintenance?.affectedServices || ['AI Weather Advisory', 'Doppler Radar Pipeline']

  return (
    <div className='min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none'>
      {/* Background Decorative Ambient Glows */}
      <div className='absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none' />
      <div className='absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none' />

      {/* Top Navbar Header */}
      <div className='max-w-5xl mx-auto w-full flex items-center justify-between z-10'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center'>
            <Wrench className='w-5 h-5 text-blue-400' />
          </div>
          <div>
            <span className='text-lg font-black tracking-tight text-white'>WeatherGPT</span>
            <span className='text-[10px] block font-bold text-amber-400 uppercase tracking-wider'>
              Maintenance Interlock
            </span>
          </div>
        </div>

        <button
          onClick={onStaffAccess}
          className='flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition shadow-sm cursor-pointer'
        >
          <ShieldCheck className='w-4 h-4 text-emerald-400' />
          <span>Authority / Admin Access (/access)</span>
          <ArrowRight className='w-3.5 h-3.5 text-slate-400' />
        </button>
      </div>

      {/* Central Announcement Card */}
      <div className='max-w-xl mx-auto w-full py-12 z-10 space-y-6 text-center'>
        {/* Animated Badge */}
        <div className='inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/80 text-amber-300 text-xs font-bold'>
          <span className='w-2 h-2 rounded-full bg-amber-400 animate-pulse' />
          <span>System-Wide Maintenance Engaged</span>
        </div>

        {/* Central Icon */}
        <div className='w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-950/40'>
          <ShieldAlert className='w-10 h-10' />
        </div>

        {/* Title and Message */}
        <div className='space-y-3'>
          <h1 className='text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight'>
            {title}
          </h1>
          <p className='text-sm text-slate-400 leading-relaxed max-w-lg mx-auto'>
            {message}
          </p>
        </div>

        {/* Estimated Completion Card */}
        <div className='p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-between max-w-md mx-auto text-xs'>
          <div className='flex items-center gap-2 text-slate-400 font-semibold'>
            <Clock className='w-4 h-4 text-amber-400' />
            <span>Estimated Resumption:</span>
          </div>
          <span className='font-mono font-bold text-white text-sm bg-white/10 px-2.5 py-1 rounded-lg'>
            {estimatedEnd}
          </span>
        </div>

        {/* Affected Modules */}
        <div className='space-y-2 pt-2'>
          <p className='text-[11px] font-bold text-slate-500 uppercase tracking-wider'>
            Active Upgrades & Affected Services:
          </p>
          <div className='flex flex-wrap items-center justify-center gap-2'>
            {affectedServices.map(svc => (
              <span
                key={svc}
                className='px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5'
              >
                <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                <span>{svc}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bypass Access CTA */}
        <div className='pt-4'>
          <button
            onClick={onStaffAccess}
            className='w-full max-w-md py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wide uppercase transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer'
          >
            <ShieldCheck className='w-4 h-4' />
            <span>Access via Authority / Admin Portal (/access)</span>
          </button>
          <p className='text-[11px] text-slate-500 mt-2'>
            Disaster management authorities & system administrators bypass maintenance with valid credentials.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className='max-w-5xl mx-auto w-full flex items-center justify-between text-[11px] text-slate-500 z-10 border-t border-slate-900 pt-4'>
        <span>WeatherGPT State Meteorological Operations • High Availability Architecture</span>
        <span className='font-mono'>Status: 503 Service Unavailable (Planned)</span>
      </div>
    </div>
  )
}

export default MaintenancePage
