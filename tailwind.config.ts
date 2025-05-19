import type { Config } from 'tailwindcss';

export default {
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			backgroundImage: {
				'gradient-blue': 'linear-gradient(to right, #000000,rgb(0, 0, 255))',
				'gradient-green': 'linear-gradient(to right, #000000,rgb(0, 255, 0))',
				'gradient-red': 'linear-gradient(to right, #000000,rgb(255, 0, 0))'
			},
			fontFamily: {
				ubuntu: ['Ubuntu', 'sans-serif'],
			},
			fontWeight: {
				regular: '400',
				medium: '500',
				bold: '700',
			},
			fontSize: {
				xs: '0.75rem',  // 12px
				sm: '0.875rem', // 14px
				md: '1rem',     // 16px
				lg: '1.25rem',  // 20px
				xl: '1.5rem',   // 24px
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
			colors: {

				input: 'gray-10',
				border: 'gray-20',
				foreground: 'black',
				background: 'white',

				white: '#FFFFFF',
				black: '#000000',
				gray: {
					10: '#e6e6e6',
					20: '#8a8a8a',
					30: '#4d4d4d',
				},
				pink: {
					10: '#f7badd',
					20: '#ed54aa',
					30: '#e31a8b',
					40: '#a01262',
					50: '#720d46',
				},
				blue: {
					10: '#a8cadf',
					20: '#5d9dc4',
					30: '#3f84af',
					40: '#244b64',
					50: '#162f3e',
				},			
				'rgb-red': 'rgb(255, 0, 0)',
        		'rgb-green': 'rgb(0, 255, 0)',
        		'rgb-blue': 'rgb(0, 0, 255)',  
			},
		},
		plugins: [require('tailwindcss-animate')],
	},
} satisfies Config;
