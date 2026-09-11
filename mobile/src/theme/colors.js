export const getColors = (isDark = false) => ({
  isDark,
  // Background & Surfaces (Modern multi-shade obsidian dark & porcelain light)
  bg: isDark ? '#0A0B0E' : '#F8F9FA',
  bgPrimary: isDark ? '#0A0B0E' : '#F8F9FA',
  card: isDark ? 'rgba(18, 19, 22, 0.78)' : 'rgba(255, 255, 255, 0.82)',
  cardAlt: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
  cardElevated: isDark ? 'rgba(28, 30, 36, 0.85)' : 'rgba(255, 255, 255, 0.92)',
  surfaceSubtle: isDark ? 'rgba(32, 34, 43, 0.60)' : 'rgba(234, 236, 239, 0.70)',
  surfaceActive: isDark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.10)',
  
  // Borders
  border: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)',
  borderLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  borderSubtle: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
  borderHighlight: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.95)',
  borderFocus: '#3B82F6',

  // Typography Tokens
  ink: isDark ? '#F4F4F6' : '#0F172A',
  inkSecondary: isDark ? '#9CA3AF' : '#475569',
  muted: isDark ? '#6B7280' : '#64748B',
  mutedLight: isDark ? '#374151' : '#94A3B8',

  // Brand Accent Azure & States
  blue: isDark ? '#3B82F6' : '#2563EB',
  blueLight: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF',
  blueHover: '#1D4ED8',
  white: '#FFFFFF',

  // Semantic Disaster Tokens
  accentAmber: '#F59E0B',
  amberLight: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
  accentRed: '#EF4444',
  redLight: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2',
  accentGreen: '#10B981',
  greenLight: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
  accentPurple: '#8B5CF6',
  purpleLight: isDark ? 'rgba(139, 92, 246, 0.15)' : '#EDE9FE',
  accentCyan: '#06B6D4',
  cyanLight: isDark ? 'rgba(6, 182, 212, 0.15)' : '#CFFAFE',
  
  statusDanger: '#EF4444',
  statusWarning: '#F97316',
  statusCaution: '#F59E0B',
  statusSafe: '#10B981',

  // Aviation Flight Rules
  flightVfr: '#10B981',
  flightMvfr: '#3B82F6',
  flightIfr: '#F59E0B',
  flightLifr: '#EF4444',

  scrim: 'rgba(0, 0, 0, 0.75)',
  glass: isDark ? 'rgba(18, 19, 22, 0.88)' : 'rgba(255, 255, 255, 0.88)',

  // Glassmorphism System (Matching WebUI .glass-panel specifications)
  glassBg: isDark ? 'rgba(18, 19, 22, 0.78)' : 'rgba(255, 255, 255, 0.82)',
  glassBgAlt: isDark ? 'rgba(24, 26, 32, 0.65)' : 'rgba(241, 243, 245, 0.75)',
  glassBgElevated: isDark ? 'rgba(28, 30, 36, 0.85)' : 'rgba(255, 255, 255, 0.92)',
  glassBorder: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  glassBorderLight: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  glassBorderHighlight: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.9)',
  glassHeroNightBg: isDark ? 'rgba(11, 17, 32, 0.85)' : 'rgba(30, 41, 59, 0.9)',
  glassHeroNightBorder: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(51, 65, 85, 0.5)',
  glassHeroDayBg: isDark ? 'rgba(3, 105, 161, 0.85)' : 'rgba(2, 132, 199, 0.88)',
  glassHeroDayBorder: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(14, 165, 233, 0.4)',

  // Celestial Atmosphere Tokens
  heroNightBg: isDark ? '#0B1120' : '#1E293B',
  heroNightBorder: isDark ? '#1E293B' : '#334155',
  heroDayBg: isDark ? '#0369A1' : '#0284C7',
  heroDayBorder: isDark ? '#0284C7' : '#38BDF8',

  // Offline Engine Badges
  offlineGold: '#F59E0B',
  offlineGoldBg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7',
  offlineGoldBorder: isDark ? 'rgba(245, 158, 11, 0.35)' : '#FDE68A',
  liveGreen: '#10B981',
  liveGreenBg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5'
})

