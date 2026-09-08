import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { 
  Plus, 
  Eye, 
  MoreHorizontal, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  CloudRain, 
  Wind, 
  Zap, 
  Waves,
  Shield, 
  Bell, 
  MapPin, 
  Clock, 
  Check,
  ChevronDown,
  Maximize2,
  Share2,
  Download
} from 'lucide-react';
import { initialAuthorityAlerts } from '../../data/mockData';
import { CreateAdvisoryModal } from '../../components/modals/CreateAdvisoryModal';

export const AuthorityAlertsPage = () => {
  const { addToast } = useWeather();
  const [alertsList, setAlertsList] = useState(initialAuthorityAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeFilterTab, setActiveFilterTab] = useState('active'); // 'active' | 'acknowledged' | 'resolved' | 'all'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeModelTab, setActiveModelTab] = useState('imd'); // 'imd' | 'gfs' | 'ecmwf'
  const [mapZoom, setMapZoom] = useState(12);

  const filterTabs = [
    { id: 'active', label: `Active (${alertsList.filter(a => a.status === 'Active').length})` },
    { id: 'acknowledged', label: 'Acknowledged' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'all', label: 'All' },
  ];

  const filteredAlerts = alertsList.filter(alert => {
    if (activeFilterTab === 'active') return alert.status === 'Active';
    if (activeFilterTab === 'acknowledged') return alert.status === 'Acknowledged';
    if (activeFilterTab === 'resolved') return alert.status === 'Resolved';
    return true;
  });

  const getSeverityBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'red':
      case 'critical':
        return 'bg-red-500 text-white dark:bg-red-600 font-bold';
      case 'orange':
      case 'high':
        return 'bg-orange-500 text-white dark:bg-orange-600 font-bold';
      case 'yellow':
      case 'moderate':
        return 'bg-amber-400 text-slate-950 font-bold';
      case 'green':
      case 'light':
        return 'bg-emerald-500 text-white dark:bg-emerald-600 font-bold';
      default:
        return 'bg-slate-500 text-white font-bold';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50';
      case 'acknowledged':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const handleAcknowledge = (id) => {
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, status: 'Acknowledged' } : a));
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => ({ ...prev, status: 'Acknowledged' }));
    }
    addToast('Alert marked as Acknowledged by District Authority', 'success');
  };

  const handleEscalate = (id) => {
    addToast('Emergency escalated to State Disaster Response Force (SDRF)', 'warning');
  };

  const handleResolve = (id) => {
    setAlertsList(prev => prev.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => ({ ...prev, status: 'Resolved' }));
    }
    addToast('Alert marked as Resolved', 'info');
  };

  const handleAlertCreated = (newAlert) => {
    setAlertsList(prev => [newAlert, ...prev]);
  };

  // =========================================================================
  // VIEW 2: ALERT DETAIL PAGE (Matching Image 3 & 4)
  // =========================================================================
  if (selectedAlert) {
    const forecast = selectedAlert.forecastOverview?.[activeModelTab] || {
      expectedRain: "80–120 mm",
      windSpeed: "25–40 km/h",
      thunderstorms: "Likely",
      floodRisk: "High"
    };

    return (
      <div className="space-y-6 animate-fadeIn pb-10">
        {/* Create Advisory Modal */}
        <CreateAdvisoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onAlertCreated={handleAlertCreated}
        />

        {/* Back Link */}
        <button
          onClick={() => setSelectedAlert(null)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Alerts</span>
        </button>

        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#111C2E] p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedAlert.title}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-xs font-black shadow-xs">
                  {selectedAlert.severityLevel === 'critical' ? 'Critical' : selectedAlert.severity}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {selectedAlert.location}
              </p>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => handleAcknowledge(selectedAlert.id)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Acknowledge</span>
            </button>

            <button
              onClick={() => handleEscalate(selectedAlert.id)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-orange-500" />
              <span>Escalate</span>
            </button>

            <button
              onClick={() => handleResolve(selectedAlert.id)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Mark as Resolved</span>
            </button>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Alert Information (6 Cols) */}
          <div className="lg:col-span-6 bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Alert Information
            </h2>

            {/* Information Key-Value Rows matching Image 3 */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Type</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAlert.type}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Severity</span>
                <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white text-xs font-bold">
                  {selectedAlert.severityLabel || `${selectedAlert.severity} (Critical)`}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAlert.location}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Start Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedAlert.startTime}, 2025</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Expiry Time</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedAlert.expiryTime}, 2025</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Source</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{selectedAlert.source}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeClass(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Affected Users</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAlert.affectedUsers}</span>
              </div>
            </div>

            {/* Description Block */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {selectedAlert.description}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Forecast Overview & Affected Area Map (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Forecast Overview Card */}
            <div className="bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Forecast Overview
                </h2>

                {/* Model Tabs: IMD / GFS / ECMWF */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {['imd', 'gfs', 'ecmwf'].map((model) => (
                    <button
                      key={model}
                      onClick={() => setActiveModelTab(model)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase ${
                        activeModelTab === model
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Metric Blocks */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <CloudRain className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{forecast.expectedRain}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Expected Rainfall</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <Wind className="w-5 h-5 text-cyan-500 mx-auto mb-1.5" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{forecast.windSpeed}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Wind Speed</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{forecast.thunderstorms}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Thunderstorms</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
                  <Waves className="w-5 h-5 text-rose-500 mx-auto mb-1.5" />
                  <p className="text-sm font-black text-slate-900 dark:text-white">{forecast.floodRisk}</p>
                  <p className="text-[11px] text-slate-400 font-medium">Flood Risk</p>
                </div>
              </div>
            </div>

            {/* Affected Area (Map) Card */}
            <div className="bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Affected Area (Map)
                </h2>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {selectedAlert.district} Sector 4
                </span>
              </div>

              {/* District Satellite Map Widget */}
              <div className="relative h-64 rounded-2xl overflow-hidden bg-[#0A111F] border border-slate-200 dark:border-slate-800">
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-70"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')`
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Simulated Red Hazard Polygon */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
                  <polygon
                    points="120,60 270,50 310,180 220,220 100,160"
                    fill="rgba(239, 68, 68, 0.45)"
                    stroke="#EF4444"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  <circle cx="200" cy="130" r="8" fill="#EF4444" />
                  <circle cx="200" cy="130" r="16" stroke="#EF4444" strokeWidth="2" fill="none" opacity="0.6" className="animate-ping" />
                  <text x="200" y="115" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">
                    {selectedAlert.district}
                  </text>
                </svg>

                {/* Map Zoom Controls */}
                <div className="absolute right-3 top-3 flex flex-col bg-slate-900/90 rounded-xl border border-white/20 shadow-lg overflow-hidden text-white">
                  <button
                    onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
                    className="p-2 hover:bg-white/20 transition text-xs font-bold"
                  >
                    +
                  </button>
                  <div className="border-t border-white/10" />
                  <button
                    onClick={() => setMapZoom(prev => Math.max(prev - 1, 6))}
                    className="p-2 hover:bg-white/20 transition text-xs font-bold"
                  >
                    -
                  </button>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium border border-white/10 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>Geographic Risk Radius: 45 km</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: ALERTS MANAGEMENT TABLE (Matching Image 2)
  // =========================================================================
  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Create Advisory Modal */}
      <CreateAdvisoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAlertCreated={handleAlertCreated}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Weather Alerts
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            View and manage all active and past alerts
          </p>
        </div>

        {/* Top Right Create Advisory Button */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Advisory</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilterTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
              activeFilterTab === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111C2E] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Table Card matching Image 2 */}
      <div className="bg-white dark:bg-[#111C2E] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Start Time</th>
                <th className="px-6 py-4">Expiry Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {filteredAlerts.map((alert) => (
                <tr 
                  key={alert.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                  onClick={() => setSelectedAlert(alert)}
                >
                  {/* Type */}
                  <td className="px-6 py-4.5 font-bold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${alert.severity === 'Red' ? 'bg-red-500' : alert.severity === 'Orange' ? 'bg-orange-500' : alert.severity === 'Yellow' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                      <span>{alert.type}</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4.5 font-semibold text-slate-700 dark:text-slate-300">
                    {alert.district}
                  </td>

                  {/* Severity */}
                  <td className="px-6 py-4.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${getSeverityBadgeClass(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </td>

                  {/* Start Time */}
                  <td className="px-6 py-4.5 font-medium text-slate-500 dark:text-slate-400">
                    {alert.startTime}
                  </td>

                  {/* Expiry Time */}
                  <td className="px-6 py-4.5 font-medium text-slate-500 dark:text-slate-400">
                    {alert.expiryTime}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4.5">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeClass(alert.status)}`}>
                      {alert.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition"
                        title="View Alert Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Acknowledge Alert"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
