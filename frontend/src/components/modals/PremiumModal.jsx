import React, { useState } from 'react';
import { useWeather } from '../../context/WeatherContext';
import { X, Crown, Check, Zap, Bell, Shield, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PremiumModal = () => {
  const { isPremiumModalOpen, setIsPremiumModalOpen, user, setUser, addToast } = useWeather();
  const [billingCycle, setBillingCycle] = useState('yearly'); // 'monthly' | 'yearly'
  const [isLoading, setIsLoading] = useState(false);

  if (!isPremiumModalOpen) return null;

  const handleUpgrade = () => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(prev => ({
        ...prev,
        plan: "Pro Member"
      }));
      setIsLoading(false);
      setIsPremiumModalOpen(false);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      addToast("🎉 Welcome to WeatherGPT Pro! Premium features unlocked.", "success");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-400/20 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative px-8 pt-8 pb-4 text-center">
          <button
            onClick={() => setIsPremiumModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-tr from-amber-500 to-amber-300 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 text-white">
            <Crown className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Upgrade to WeatherGPT Pro</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Unlock advanced satellite radar, unlimited saved locations, and real-time severe weather alert dispatch.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-2 mt-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-max mx-auto text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly ($4.99/mo)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                billingCycle === 'yearly'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Yearly ($39/yr)
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">Save 35%</span>
            </button>
          </div>
        </div>

        {/* Feature List */}
        <div className="px-8 py-4 space-y-3">
          {[
            "Save unlimited locations across the world",
            "10-Day High-Resolution Radar & Doppler loop playback",
            "Instant SMS & Push Notifications for extreme alerts",
            "Ad-free experience with dedicated low-latency AI servers",
            "Custom CSV/JSON weather data exports & API access"
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="p-8 pt-4">
          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                {user.plan === "Pro Member" ? "Already a Pro Member" : "Get WeatherGPT Pro Now"}
              </>
            )}
          </button>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3">
            Cancel anytime • 7-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
};
