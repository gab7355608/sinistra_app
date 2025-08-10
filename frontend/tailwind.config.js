/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			primary: {
  				50: '#faf5ff',
  				100: '#f3e8ff',
  				200: '#e9d5ff',
  				300: '#d8b4fe',
  				400: '#c084fc',
  				500: '#a855f7',
  				600: '#9333ea',
  				700: '#7c3aed',
  				800: '#6b21a8',
  				900: '#581c87',
  				950: '#3b0764'
  			},
  			secondary: {
  				50: '#f8fafc',
  				100: '#f1f5f9',
  				200: '#e2e8f0',
  				300: '#cbd5e1',
  				400: '#94a3b8',
  				500: '#64748b',
  				600: '#475569',
  				700: '#334155',
  				800: '#1e293b',
  				900: '#0f172a'
  			},
  			accent: {
  				50: '#fdf2f8',
  				100: '#fce7f3',
  				200: '#fbcfe8',
  				300: '#f9a8d4',
  				400: '#f472b6',
  				500: '#ec4899',
  				600: '#db2777',
  				700: '#be185d',
  				800: '#9d174d',
  				900: '#831843'
  			},
  			success: {
  				50: '#f0fdf4',
  				100: '#dcfce7',
  				200: '#bbf7d0',
  				300: '#86efac',
  				400: '#4ade80',
  				500: '#22c55e',
  				600: '#16a34a',
  				700: '#15803d',
  				800: '#166534',
  				900: '#14532d'
  			},
  			danger: {
  				50: '#fef2f2',
  				100: '#fee2e2',
  				200: '#fecaca',
  				300: '#fca5a5',
  				400: '#f87171',
  				500: '#ef4444',
  				600: '#dc2626',
  				700: '#b91c1c',
  				800: '#991b1b',
  				900: '#7f1d1d'
  			},
  			warning: {
  				50: '#fffbeb',
  				100: '#fef3c7',
  				200: '#fde68a',
  				300: '#fcd34d',
  				400: '#fbbf24',
  				500: '#f59e0b',
  				600: '#d97706',
  				700: '#b45309',
  				800: '#92400e',
  				900: '#78350f'
  			}
  		},
  		backgroundImage: {
  			'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  			'gradient-accent': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  			'gradient-purple': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  			'gradient-modern': 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

