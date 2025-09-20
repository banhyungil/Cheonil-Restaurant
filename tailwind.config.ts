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
    /**
     * safelist기능이 없어지고 @source inline 명령어를 사용하여야 함
     * example
     * @source inline("{hover:,}bg-indigo-{50,{300..500},800,950}");
     *
     * Generates grid-cols-1, grid-cols-2, ..., grid-cols-12
     * * @source inline("{sm:,md:,lg:,xl:,}grid-cols-{1..12}");
     * @see https://github.com/tailwindlabs/tailwindcss/pull/17147
     * */
    // safelist: [{ pattern: /animate-delay-.+/ }],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'rgb(var(--color-primary) / <alpha-value>)',
                secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
                success: 'rgb(var(--color-success) / <alpha-value>)',
                info: 'rgb(var(--color-info) / <alpha-value>)',
                warning: 'rgb(var(--color-warning) / <alpha-value>)',
                pending: 'rgb(var(--color-pending) / <alpha-value>)',
                danger: 'rgb(var(--color-danger) / <alpha-value>)',
                light: 'rgb(var(--color-light) / <alpha-value>)',
                lightgray: 'rgb(var(--color-light-gray) / <alpha-value>)',
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
        /* eslint-disable @typescript-eslint/no-require-imports */
        require('@tailwindcss/forms'),
        plugin(({ addBase, matchUtilities, addUtilities }) => {
            addBase({
                ':root': {
                    '--color-primary': hexToRGB('#2aac8e'),
                    '--color-secondary': hexToRGB(colors.slate['200']),
                    '--color-success': hexToRGB('#5697d4'),
                    '--color-info': hexToRGB(colors.cyan['500']),
                    '--color-warning': hexToRGB(colors.amber['500']),
                    '--color-pending': hexToRGB(colors.orange['500']),
                    // '--color-danger': hexToRGB(colors.red['700']),
                    '--color-danger': hexToRGB('#fa4a4a'),
                    '--color-light': hexToRGB(colors.slate['100']),
                    '--color-light-gray': hexToRGB('#585654'),
                    // '--color-dark': hexToRGB(colors.slate['800']),
                    '--color-dark': hexToRGB('#2d2d2d'),
                },
                '.dark': {
                    '--color-primary': hexToRGB(colors.orange['600']),
                    '--color-darkmode-50': hexToRGB('#576784'), // 87 103 132
                    '--color-darkmode-100': hexToRGB('#4a5a79'), // 74  90 121
                    '--color-darkmode-200': hexToRGB('#415172'), // 65  81 114
                    '--color-darkmode-300': hexToRGB('#354567'), // 53  69 103
                    '--color-darkmode-400': hexToRGB('#303d5d'), // 48  61  93
                    '--color-darkmode-500': hexToRGB('#293552'), // 41  53  82
                    '--color-darkmode-600': hexToRGB('#28334e'), // 40  51  78
                    '--color-darkmode-700': hexToRGB('#232d45'), // 35  45  69
                    '--color-darkmode-800': hexToRGB('#1b253b'), // 27  37  59
                    '--color-darkmode-900': hexToRGB('#0f172a'), // 15  23  42
                },
            })
            ;(addUtilities({
                '.flex-center': {
                    display: 'flex',
                    'justify-content': 'center',
                    'align-items': 'center',
                },
            }),
                matchUtilities(
                    {
                        'animate-delay': (value) => ({ 'animation-delay': value }),
                    },
                    {
                        values: Object.fromEntries(Array.from({ length: 50 }, (_, i) => [i * 10, `${i * 0.1}s`])),
                    }
                ))

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
}

export default config
