import plugin from 'tailwindcss/plugin'
import colors from 'tailwindcss/colors'
import type { Config } from 'tailwindcss'

/** Converts HEX color to RGB string */
function hexToRGB(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r} ${g} ${b}`
}

const config: Config = {
    content: ['./src/**/*.{js,jsx,ts,vue}'],
    safelist: [{ pattern: /animate-delay-.+/ }],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                success: 'rgb(rgb(var(--color-success)) / <alpha-value>)',
                info: 'rgb(var(--color-info) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                pending: 'rgb(var(--color-pending) / <alpha-value>)',
                danger: 'rgb(rgb(var(--color-danger)) / <alpha-value>)',
                light: 'rgb(var(--color-light) / <alpha-value>)',
                dark: 'rgb(var(--color-dark) / <alpha-value>)',
                darkmode: Object.fromEntries(
                    [50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((v) => [v, `rgb(var(--color-darkmode-${v}) / <alpha-value>)`])
                ),
            },
            fontFamily: {
                roboto: ['Roboto'],
            },
            container: {
                center: true,
            },
            maxWidth: {
                '1/4': '25%',
                '1/2': '50%',
                '3/4': '75%',
            },
            strokeWidth: {
                0.5: '0.5',
                1.5: '1.5',
                2.5: '2.5',
            },
            backgroundImage: {
                'menu-active': `url("data:image/svg+xml;charset=utf-8,...")`,
                'menu-active-dark': `url("data:image/svg+xml;charset=utf-8,...")`,
                'skew-pattern': `url("data:image/svg+xml,...")`,
                'skew-pattern-dark': `url("data:image/svg+xml,...")`,
                'bredcrumb-chevron-dark': `url("data:image/svg+xml,...")`,
                'bredcrumb-chevron-light': `url("data:image/svg+xml,...")`,
                'bredcrumb-chevron-darkmode': `url("data:image/svg+xml,...")`,
            },
            keyframes: {
                'intro-divider': {
                    '100%': { opacity: '1' },
                },
                'intro-menu': {
                    '100%': { opacity: '1', transform: 'translateX(0px)' },
                },
                'active-side-menu-chevron': {
                    '100%': { opacity: '1', 'margin-right': '-27px' },
                },
                'intro-top-menu': {
                    '100%': { opacity: '1', transform: 'translateY(0px)' },
                },
                'active-top-menu-chevron': {
                    '100%': { opacity: '1', 'margin-bottom': '-54px' },
                },
                'intro-wrapper': {
                    '100%': { opacity: '1', transform: 'translateX(0px)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        plugin(({ addBase, matchUtilities }) => {
            addBase({
                ':root': {
                    '--color-primary': hexToRGB(colors.orange['900']),
                    '--color-secondary': hexToRGB(colors.slate['200']),
                    '--color-success': hexToRGB(colors.teal['600']),
                    '--color-info': hexToRGB(colors.cyan['500']),
                    '--color-warning': hexToRGB(colors.amber['500']),
                    '--color-pending': hexToRGB(colors.orange['500']),
                    '--color-danger': hexToRGB(colors.red['700']),
                    '--color-light': hexToRGB(colors.slate['100']),
                    '--color-dark': hexToRGB(colors.slate['800']),
                },
                '.dark': {
                    '--color-primary': hexToRGB(colors.orange['800']),
                    '--color-darkmode-50': '87 103 132',
                    '--color-darkmode-100': '74 90 121',
                    '--color-darkmode-200': '65 81 114',
                    '--color-darkmode-300': '53 69 103',
                    '--color-darkmode-400': '48 61 93',
                    '--color-darkmode-500': '41 53 82',
                    '--color-darkmode-600': '40 51 78',
                    '--color-darkmode-700': '35 45 69',
                    '--color-darkmode-800': '27 37 59',
                    '--color-darkmode-900': '15 23 42',
                },
            })

            matchUtilities(
                {
                    'animate-delay': (value) => ({ 'animation-delay': value }),
                },
                {
                    values: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [i * 10, `${i * 0.1}s`])),
                }
            )

            matchUtilities(
                {
                    'animate-fill-mode': (value) => ({ 'animation-fill-mode': value }),
                },
                {
                    values: {
                        none: 'none',
                        forwards: 'forwards',
                        backwards: 'backwards',
                        both: 'both',
                    },
                }
            )
        }),
    ],
    variants: {
        extend: {
            boxShadow: ['dark'],
        },
    },
}

export default config
