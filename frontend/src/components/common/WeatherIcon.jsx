import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudDrizzle, 
  CloudLightning, 
  Wind, 
  AlertTriangle, 
  MapPin, 
  Thermometer, 
  ShieldCheck, 
  Disc, 
  Droplets 
} from 'lucide-react';

export const WeatherIcon = ({ type, condition, className = "w-6 h-6", size }) => {
  const iconProps = {
    className,
    ...(size ? { size } : {})
  };

  const normalized = (type || condition || '').toLowerCase();

  if (normalized.includes('sun') || normalized.includes('clear')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Sun {...iconProps} className={`${className} text-amber-500 fill-amber-400`} />
      </div>
    );
  }

  if (normalized.includes('partly') || normalized.includes('sun-cloud') || (normalized.includes('cloud') && normalized.includes('sun'))) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <CloudSun {...iconProps} className={`${className} text-amber-400`} />
      </div>
    );
  }

  if (normalized.includes('drizzle') || normalized.includes('light rain')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <CloudDrizzle {...iconProps} className={`${className} text-blue-400`} />
      </div>
    );
  }

  if (normalized.includes('rain')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <CloudRain {...iconProps} className={`${className} text-blue-500 fill-blue-100 dark:fill-blue-900/40`} />
      </div>
    );
  }

  if (normalized.includes('thunder') || normalized.includes('storm') || normalized.includes('lightning')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <CloudLightning {...iconProps} className={`${className} text-purple-500`} />
      </div>
    );
  }

  if (normalized.includes('cyclone')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Disc {...iconProps} className={`${className} text-purple-600 animate-spin-slow`} />
      </div>
    );
  }

  if (normalized.includes('cloud')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Cloud {...iconProps} className={`${className} text-slate-400 fill-slate-200 dark:fill-slate-700`} />
      </div>
    );
  }

  if (normalized.includes('wind') || normalized.includes('air')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Wind {...iconProps} className={`${className} text-emerald-500`} />
      </div>
    );
  }

  if (normalized.includes('alert') || normalized.includes('warning')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <AlertTriangle {...iconProps} className={`${className} text-rose-500`} />
      </div>
    );
  }

  if (normalized.includes('location')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <MapPin {...iconProps} className={`${className} text-blue-500`} />
      </div>
    );
  }

  if (normalized.includes('thermo') || normalized.includes('temp')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <Thermometer {...iconProps} className={`${className} text-rose-500`} />
      </div>
    );
  }

  if (normalized.includes('shield') || normalized.includes('safe')) {
    return (
      <div className="relative inline-flex items-center justify-center">
        <ShieldCheck {...iconProps} className={`${className} text-emerald-500`} />
      </div>
    );
  }

  // Default fallback
  return <CloudSun {...iconProps} className={`${className} text-blue-500`} />;
};
