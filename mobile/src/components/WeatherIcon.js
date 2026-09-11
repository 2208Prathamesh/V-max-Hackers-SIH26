import React from 'react'
import { View } from 'react-native'
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
  Disc
} from 'lucide-react-native'

export function WeatherIcon ({
  type,
  condition,
  size = 24,
  color,
  style
}) {
  const normalized = (type || condition || '').toLowerCase()

  const renderIcon = () => {
    if (normalized.includes('sun') || normalized.includes('clear')) {
      return <Sun size={size} color={color || '#F59E0B'} />
    }

    if (
      normalized.includes('partly') ||
      normalized.includes('sun-cloud') ||
      (normalized.includes('cloud') && normalized.includes('sun'))
    ) {
      return <CloudSun size={size} color={color || '#FBBF24'} />
    }

    if (normalized.includes('drizzle') || normalized.includes('light rain')) {
      return <CloudDrizzle size={size} color={color || '#60A5FA'} />
    }

    if (normalized.includes('rain') || normalized.includes('shower')) {
      return <CloudRain size={size} color={color || '#3B82F6'} />
    }

    if (
      normalized.includes('thunder') ||
      normalized.includes('storm') ||
      normalized.includes('lightning')
    ) {
      return <CloudLightning size={size} color={color || '#A855F7'} />
    }

    if (normalized.includes('cyclone')) {
      return <Disc size={size} color={color || '#9333EA'} />
    }

    if (normalized.includes('cloud') || normalized.includes('overcast')) {
      return <Cloud size={size} color={color || '#94A3B8'} />
    }

    if (normalized.includes('wind') || normalized.includes('air') || normalized.includes('breeze')) {
      return <Wind size={size} color={color || '#10B981'} />
    }

    if (normalized.includes('alert') || normalized.includes('warning') || normalized.includes('danger')) {
      return <AlertTriangle size={size} color={color || '#EF4444'} />
    }

    if (normalized.includes('location') || normalized.includes('pin')) {
      return <MapPin size={size} color={color || '#3B82F6'} />
    }

    if (normalized.includes('thermo') || normalized.includes('temp')) {
      return <Thermometer size={size} color={color || '#F43F5E'} />
    }

    if (normalized.includes('shield') || normalized.includes('safe')) {
      return <ShieldCheck size={size} color={color || '#10B981'} />
    }

    if (normalized.includes('humidity') || normalized.includes('drop') || normalized.includes('precip')) {
      return <CloudRain size={size} color={color || '#06B6D4'} />
    }

    // Default fallback
    return <CloudSun size={size} color={color || '#3B82F6'} />
  }

  return <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>{renderIcon()}</View>
}

export default WeatherIcon
