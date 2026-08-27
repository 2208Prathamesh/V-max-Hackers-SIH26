import React from 'react';
import { X, AlertTriangle, ShieldCheck, MapPin, Clock, Share2, CheckCircle2 } from 'lucide-react';

export const AlertDetailsModal = ({ alert, isOpen, onClose, onShare }) => {
  if (!isOpen || !alert) return null;

  const isSevere = alert.severity === 'Severe' || alert.severityLevel === 'high';
  const isModerate = alert.severity === 'Moderate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className={`p-6 border-b ${
          isSevere 
            ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50' 
            : isModerate 
            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50' 
            : 'bg-yellow-50/80 dark:bg-yellow-950/40 border-yellow-100 dark:border-yellow-900/50'
        } flex items-start justify-between`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isSevere 
                ? 'bg-rose-600 text-white' 
                : isModerate 
                ? 'bg-amber-500 text-white' 
                : 'bg-yellow-500 text-white'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                  isSevere 
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200' 
                    : isModerate 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200'
                }`}>
                  {alert.severity || 'Warning'} Alert
                </span>
                <span className="text-xs text-slate-500 font-medium">Source: {alert.source || 'IMD'}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                {alert.title}
              </h3>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                <span>{alert.region || alert.location}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Validity timeframe */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-blue-500" />
              <span><strong>Effective:</strong> {alert.effectiveTime || alert.time || '21 May 2025, 8:20 AM'}</span>
            </div>
            <div className="text-slate-500">
              <span><strong>Until:</strong> {alert.untilTime || '22 May 2025, 8:00 AM'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1.5">
              Meteorological Advisory
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              {alert.description || alert.fullDescription || 'Heavy rainfall expected in the next 24 hours. Widespread rainfall may cause waterlogging in low lying areas and traffic disruptions.'}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Confidence / Prob.</span>
              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{alert.probability || '80%'}</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Urgency</span>
              <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">Immediate</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Authority</span>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">IMD Pune</span>
            </div>
          </div>

          {/* Safety Recommendations */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Recommended Precautions
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Stay indoors and avoid travel through known waterlogged passages.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Keep emergency flashlights, drinking water, and essential medicines ready.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unplug sensitive electronic devices during severe electrical thunderstorms.</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onShare}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Alert</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Acknowledge</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
