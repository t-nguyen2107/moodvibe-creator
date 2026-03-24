/**
 * MoodVibe Branding Colors
 * Extracted from moodvibe-logo.png
 *
 * Logo Gradient Analysis:
 * - Primary Gradient: Cyan (#06b6d4) → Magenta (#d946ef)
 * - Secondary Accent: Rose (#f43f5e)
 * - Mood: Energetic, Creative, Modern
 */

// ===== Primary Brand Colors =====
export const brandColors = {
  // Main gradient colors (from logo)
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4', // Primary cyan
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },

  magenta: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Primary magenta
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },

  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e', // Accent rose
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
}

// ===== Gradient Definitions =====
export const gradients = {
  // Primary brand gradient (from logo)
  primary: 'from-cyan-500 via-cyan-400 to-magenta-500',
  primaryDark: 'from-cyan-600 via-cyan-500 to-magenta-600',

  // Secondary gradients
  sunrise: 'from-rose-400 via-orange-400 to-yellow-400',
  sunset: 'from-purple-500 via-pink-500 to-rose-500',
  ocean: 'from-blue-500 via-cyan-500 to-teal-500',
  forest: 'from-emerald-500 via-green-500 to-teal-500',

  // Mood-based gradients
  chill: 'from-blue-400 via-cyan-400 to-teal-400',
  energetic: 'from-orange-500 via-red-500 to-pink-500',
  happy: 'from-yellow-400 via-orange-400 to-rose-400',
  romantic: 'from-pink-400 via-rose-500 to-red-500',
  focus: 'from-emerald-400 via-teal-400 to-cyan-400',
  sad: 'from-blue-600 via-indigo-600 to-purple-700',
}

// ===== Semantic Colors =====
export const semanticColors = {
  // Success
  success: {
    light: '#10b981',
    DEFAULT: '#059669',
    dark: '#047857',
  },

  // Warning
  warning: {
    light: '#f59e0b',
    DEFAULT: '#d97706',
    dark: '#b45309',
  },

  // Error
  error: {
    light: '#ef4444',
    DEFAULT: '#dc2626',
    dark: '#b91c1c',
  },

  // Info
  info: {
    light: '#3b82f6',
    DEFAULT: '#2563eb',
    dark: '#1d4ed8',
  },
}

// ===== Background Colors =====
export const backgroundColors = {
  // Light mode
  light: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
    accent: '#ecfeff',
  },

  // Dark mode
  dark: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    accent: '#083344',
  },
}

// ===== Text Colors =====
export const textColors = {
  // Light mode
  light: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
  },

  // Dark mode
  dark: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#64748b',
    inverse: '#0f172a',
  },
}

// ===== Shadow Colors =====
export const shadowColors = {
  cyan: 'rgba(6, 182, 212, 0.15)',
  magenta: 'rgba(217, 70, 239, 0.15)',
  rose: 'rgba(244, 63, 94, 0.15)',
}

// ===== Component-Specific Colors =====
export const componentColors = {
  // Buttons
  button: {
    primary: 'bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600',
    secondary: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  },

  // Cards
  card: {
    primary: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
    gradient: 'bg-gradient-to-br from-cyan-50 to-magenta-50 dark:from-cyan-950/30 dark:to-magenta-950/30',
  },

  // Inputs
  input: {
    primary: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-cyan-500 focus:border-cyan-500',
  },

  // Badges/Tags
  badge: {
    cyan: 'bg-cyan-500 text-white',
    magenta: 'bg-magenta-500 text-white',
    rose: 'bg-rose-500 text-white',
    gradient: 'bg-gradient-to-r from-cyan-500 to-magenta-500 text-white',
  },
}

// ===== CSS Custom Properties (for tailwind.config.js) =====
export const cssVariables = {
  '--brand-cyan-50': '#ecfeff',
  '--brand-cyan-100': '#cffafe',
  '--brand-cyan-200': '#a5f3fc',
  '--brand-cyan-300': '#67e8f9',
  '--brand-cyan-400': '#22d3ee',
  '--brand-cyan-500': '#06b6d4',
  '--brand-cyan-600': '#0891b2',
  '--brand-cyan-700': '#0e7490',
  '--brand-cyan-800': '#155e75',
  '--brand-cyan-900': '#164e63',
  '--brand-cyan-950': '#083344',

  '--brand-magenta-50': '#fdf4ff',
  '--brand-magenta-100': '#fae8ff',
  '--brand-magenta-200': '#f5d0fe',
  '--brand-magenta-300': '#f0abfc',
  '--brand-magenta-400': '#e879f9',
  '--brand-magenta-500': '#d946ef',
  '--brand-magenta-600': '#c026d3',
  '--brand-magenta-700': '#a21caf',
  '--brand-magenta-800': '#86198f',
  '--brand-magenta-900': '#701a75',
  '--brand-magenta-950': '#4a044e',

  '--brand-rose-500': '#f43f5e',
  '--brand-rose-600': '#e11d48',
}

// ===== Gradient Animation Classes =====
export const gradientAnimations = {
  shimmer: 'animate-shimmer',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce',
}

// ===== Usage Examples =====
/**
 * Button with brand gradient:
 * className="bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white font-bold"
 *
 * Card with brand gradient border:
 * className="border-2 border-transparent bg-gradient-to-r from-cyan-500 to-magenta-500 p-[2px] rounded-2xl"
 *   <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
 *     Content
 *   </div>
 *
 * Text with gradient:
 * className="bg-gradient-to-r from-cyan-500 to-magenta-500 bg-clip-text text-transparent font-bold"
 *
 * Icon with brand gradient background:
 * className="bg-gradient-to-br from-cyan-500 to-magenta-500 p-3 rounded-xl"
 */
