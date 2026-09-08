import React, { useState } from 'react';
import { X, AlertTriangle, Send, Bell, MapPin, Calendar, Clock, Shield } from 'lucide-react';
import { useWeather } from '../../context/WeatherContext';

export const CreateAdvisoryModal = ({ isOpen, onClose, onAlertCreated }) => {
  const { addToast } = useWeather();
  const [formData, setFormData] = useState({
    title: '',
    type: 'Heavy Rainfall',
    district: 'Pune',
    severity: 'Orange',
    startTime: '9 Sep, 12:00',
    expiryTime: '9 Sep, 22:00',
    description: '',
    affectedUsers: '3,500'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newAlert = {
        id: `auth-alert-${Date.now()}`,
        type: formData.type,
        iconType: formData.type.toLowerCase().includes('rain') ? 'rain' : formData.type.toLowerCase().includes('thunder') ? 'thunderstorm' : 'wind',
        title: formData.title || `${formData.type} Warning`,
        location: `${formData.district} District, Maharashtra`,
        district: formData.district,
        severity: formData.severity,
        severityLabel: `${formData.severity} (${formData.severity === 'Red' ? 'Critical' : formData.severity === 'Orange' ? 'High' : formData.severity === 'Yellow' ? 'Moderate' : 'Light'})`,
        severityLevel: formData.severity === 'Red' ? 'critical' : formData.severity === 'Orange' ? 'high' : formData.severity === 'Yellow' ? 'moderate' : 'low',
        startTime: formData.startTime,
        expiryTime: formData.expiryTime,
        status: 'Active',
        source: 'State Disaster Management',
        affectedUsers: formData.affectedUsers || '2,500',
        timeAgo: 'Just now',
        description: formData.description || `Immediate advisory issued for ${formData.district}. Citizens are advised to exercise caution and follow civil defense directives.`,
        forecastOverview: {
          imd: { expectedRain: "50–90 mm", windSpeed: "30–45 km/h", thunderstorms: "Likely", floodRisk: "Moderate" },
          gfs: { expectedRain: "45–80 mm", windSpeed: "25–40 km/h", thunderstorms: "Possible", floodRisk: "Moderate" },
          ecmwf: { expectedRain: "55–95 mm", windSpeed: "35–50 km/h", thunderstorms: "Likely", floodRisk: "High" }
        },
        lat: 18.5204,
        lng: 73.8567
      };

      if (onAlertCreated) {
        onAlertCreated(newAlert);
      }

      addToast(`Official Advisory published for ${formData.district}!`, 'success');
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-white dark:bg-[#111C2E] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Issue Emergency Weather Advisory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Broadcast public warnings across state districts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Advisory Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Advisory Headline
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Flash Flood & Heavy Inundation Warning"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* District & Severity Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target District
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Pune">Pune District</option>
                <option value="Mumbai">Mumbai Metropolitan</option>
                <option value="Nashik">Nashik District</option>
                <option value="Ratnagiri">Ratnagiri Coast</option>
                <option value="Kolhapur">Kolhapur Basin</option>
                <option value="Nagpur">Nagpur Division</option>
                <option value="Satara">Satara District</option>
                <option value="Aurangabad">Aurangabad (Sambhaji Nagar)</option>
                <option value="Solapur">Solapur District</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Alert Severity Level
              </label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Red">Red (Critical Action Required)</option>
                <option value="Orange">Orange (High Alert)</option>
                <option value="Yellow">Yellow (Moderate Watch)</option>
                <option value="Green">Green (Light Advisory)</option>
              </select>
            </div>
          </div>

          {/* Warning Type & Affected Users */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Meteorological Hazard
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              >
                <option value="Heavy Rainfall">Heavy Rainfall</option>
                <option value="Thunderstorm">Thunderstorm & Lightning</option>
                <option value="Strong Winds">Gale & Strong Winds</option>
                <option value="Flood Watch">River Basin Flood Watch</option>
                <option value="Heat Alert">Severe Heatwave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Estimated Citizens at Risk
              </label>
              <input
                type="text"
                name="affectedUsers"
                placeholder="e.g. 4,200"
                value={formData.affectedUsers}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description / Instructions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Public Instructions & Civil Directives
            </label>
            <textarea
              name="description"
              rows={3}
              required
              placeholder="Describe emergency instructions, evacuation recommendations, or transport advisories..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition cursor-pointer disabled:opacity-75"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Broadcasting...' : 'Publish Advisory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
