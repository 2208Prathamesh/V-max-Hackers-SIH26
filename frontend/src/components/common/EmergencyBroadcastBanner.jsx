import React, { useState, useEffect, useMemo } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  AlertTriangle, 
  PhoneCall, 
  X, 
  ChevronRight, 
  ShieldAlert, 
  MapPin, 
  CloudRain, 
  SunMedium, 
  Info,
  Radio
} from 'lucide-react';

export const EmergencyBroadcastBanner = ({ onSelectDistrict }) => {
  const { setCurrentPage, addToast, alerts } = useWeather();
  const { language, t, translateCity, translateAlertTitle } = useLanguage();

  const [isHotlineModalOpen, setIsHotlineModalOpen] = useState(false);
  const [selectedQuickDistrict, setSelectedQuickDistrict] = useState(null);

  // Dynamic Emergency Districts derived directly from MongoDB / Seed Database
  const quickDistricts = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    // Prioritize highest severity alerts first: extreme -> high -> moderate -> low
    const severityRank = { extreme: 4, high: 3, moderate: 2, low: 1 };
    const sorted = [...alerts].sort((a, b) => {
      const rA = severityRank[a.severity] || 0;
      const rB = severityRank[b.severity] || 0;
      return rB - rA;
    });

    return sorted.map((a, idx) => {
      const city = a.location ? a.location.split(',')[0].trim() : 'District';
      const status =
        a.severity === 'extreme'
          ? 'red'
          : a.severity === 'high'
          ? 'orange'
          : a.severity === 'moderate'
          ? 'yellow'
          : 'green';

      const localizedCity = translateCity(city);
      const localizedHazard = translateAlertTitle(a.title);

      return {
        id: a._id || a.id || `dist-${idx}`,
        nameEn: city,
        nameHi: localizedCity,
        nameMr: localizedCity,
        status,
        hazardEn: a.title,
        hazardHi: localizedHazard,
        hazardMr: localizedHazard,
        description: a.description,
        action: a.action,
        alert: a
      };
    });
  }, [alerts, translateCity, translateAlertTitle]);

  const activeDistrictId = selectedQuickDistrict || quickDistricts[0]?.id;
  const currentDistrictInfo = quickDistricts.find(d => d.id === activeDistrictId) || quickDistricts[0] || {
    id: 'default',
    nameEn: 'Maharashtra',
    nameHi: 'महाराष्ट्र',
    nameMr: 'महाराष्ट्र',
    status: 'orange',
    hazardEn: 'Weather Monitoring Active',
    hazardHi: 'मौसम निगरानी सक्रिय',
    hazardMr: 'हवामान निरीक्षण सुरू आहे'
  };

  const handleDistrictChange = (district) => {
    setSelectedQuickDistrict(district.id);
    if (onSelectDistrict) {
      onSelectDistrict(district);
    }
  };

  return (
    <>
      {/* Emergency Hotline Modal */}
      {isHotlineModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hotline-title"
        >
          <div className="bg-white dark:bg-[#0E1726] border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 id="hotline-title" className="text-lg font-bold text-slate-900 dark:text-white">
                    {t('emergencyContactsTitle')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('emergencyContactsSubtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHotlineModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label={t('close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Emergency Hotline Cards */}
            <div className="space-y-2.5">
              <a 
                href="tel:112"
                className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-300 dark:border-rose-700/80 rounded-2xl hover:bg-rose-100/80 dark:hover:bg-rose-900/60 transition group shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    112
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'mr' ? 'राष्ट्रीय आपत्कालीन सेवा (सर्वसमावेशक)' : language === 'hi' ? 'राष्ट्रीय आपातकालीन सेवा (अखिल भारतीय)' : 'National Emergency Response System'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {language === 'mr' ? 'पोलीस, अग्निशमन, रुग्णवाहिका' : language === 'hi' ? 'पुलिस, अग्निशमन, एम्बुलेंस' : 'Police, Fire, Ambulance 24x7'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('callNow')}</span>
                </div>
              </a>

              <a 
                href="tel:1078"
                className="flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 rounded-2xl hover:bg-amber-100/80 dark:hover:bg-amber-900/60 transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    1078
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {t('disasterHelpline')}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {language === 'mr' ? 'पूर, दरड कोसळणे व वादळ बचाव' : language === 'hi' ? 'बाढ़, भूस्खलन और चक्रवात बचाव' : 'Flood, Landslide & Cyclone Disaster Relief'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('callNow')}</span>
                </div>
              </a>

              <a 
                href="tel:1070"
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    1070
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {language === 'mr' ? 'राज्य आपत्ती निवारण केंद्र (SDMA)' : language === 'hi' ? 'राज्य आपदा प्रबंधन केंद्र (SDMA)' : 'State Disaster Management Control'}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {language === 'mr' ? 'मंत्रालय मदत व पुनर्वसन नियंत्रण कक्ष' : language === 'hi' ? 'राहत एवं बचाव नियंत्रण कक्ष' : 'State Emergency Operations Center'}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs group-hover:scale-105 transition">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t('callNow')}</span>
                </div>
              </a>
            </div>

            <button
              onClick={() => setIsHotlineModalOpen(false)}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Main StitchMCP Emergency Command Banner */}
      <section 
        className="glass-panel rounded-3xl p-4 sm:p-5 border-l-4 border-l-rose-500 border border-slate-200/80 dark:border-slate-800 shadow-lg bg-gradient-to-r from-rose-50/70 via-white to-amber-50/50 dark:from-[#1F1014]/90 dark:via-[#131926]/90 dark:to-[#1E1710]/90 transition-all"
        aria-label={t('emergencyBroadcast')}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Severity Badge & Alert Headline */}
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/30 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-600 text-white flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  {t('immediateDanger')}
                </span>

                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5" />
                  {t('heavyRainfall')}
                </span>

                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                  <SunMedium className="w-3.5 h-3.5" />
                  {t('heatwaveAdvisory')}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>
                    {language === 'mr' ? currentDistrictInfo.nameMr : language === 'hi' ? currentDistrictInfo.nameHi : currentDistrictInfo.nameEn}:
                  </span>
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                    {language === 'mr' ? currentDistrictInfo.hazardMr : language === 'hi' ? currentDistrictInfo.hazardHi : currentDistrictInfo.hazardEn}
                  </span>
                </h2>
              </div>
            </div>
          </div>

          {/* Right: Emergency Hotline CTA & View All Button */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 dark:border-slate-800/80">

            {/* Emergency Hotline 112 Button */}
            <button
              onClick={() => setIsHotlineModalOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-md shadow-rose-600/25"
              aria-label={t('emergencyHotline')}
            >
              <PhoneCall className="w-4 h-4" />
              <span>{t('emergencyHotline')}</span>
            </button>

            {/* Full Alerts Page Jump Button */}
            <button
              onClick={() => setCurrentPage('alerts')}
              className="min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              title={t('viewAll')}
            >
              <span>{t('viewAll')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* District Quick Triage Selector Pill Row */}
        <div className="mt-3.5 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('districtTriage')}:</span>
          </span>

          {quickDistricts.map((district) => {
            const isSelected = activeDistrictId === district.id;
            const displayName = language === 'mr' ? district.nameMr : language === 'hi' ? district.nameHi : district.nameEn;
            
            const badgeColor = 
              district.status === 'red' 
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30' 
                : district.status === 'orange'
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30'
                : district.status === 'yellow'
                ? 'bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border-yellow-500/30'
                : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';

            return (
              <button
                key={district.id}
                onClick={() => handleDistrictChange(district)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-xs scale-102'
                    : `${badgeColor} hover:opacity-90`
                }`}
                aria-pressed={isSelected}
              >
                <span className={`w-2 h-2 rounded-full ${
                  district.status === 'red' ? 'bg-rose-500' : district.status === 'orange' ? 'bg-amber-500' : district.status === 'yellow' ? 'bg-yellow-400' : 'bg-emerald-500'
                }`} />
                <span>{displayName}</span>
              </button>
            );
          })}
        </div>
      </section>
    </>
  );
};

export default EmergencyBroadcastBanner;
