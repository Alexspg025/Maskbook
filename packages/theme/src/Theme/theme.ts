import { MaskColors } from './colors.js'
import type { PaletteMode, ThemeOptions } from '@mui/material'
import { createTheme } from '@mui/material'
import { merge } from 'lodash-es'
import * as Components from './component-changes.js'
import { grey } from '@mui/material/colors'

function getFontFamily(monospace?: boolean) {
    // We want to look native.
    // Windows has no CJK sans monospace. Accommodate that.
    // We only use it for fingerprints anyway so CJK coverage ain't a problem... yet.
    const monofont = navigator.platform.startsWith('Win') ? 'Consolas, monospace' : 'monospace'
    // https://caniuse.com/font-family-system-ui
    // Firefox does NOT support yet it in any form on Windows, but tests indicate that it agrees with Edge in using the UI font for sans-serif:
    // Microsoft YaHei on zh-Hans-CN.
    return !monospace ? '-apple-system, system-ui, sans-serif' : monofont
}

function MaskTheme(mode: PaletteMode) {
    const maskColors = MaskColors[mode]
    const theme = merge(
        {
            palette: {
                ...maskColors,
                primary: { main: '#1c68f3' },
                text: {
                    ...maskColors.text,
                    hint: 'rgba(0, 0, 0, 0.38)',
                },
            },
            typography: {
                fontFamily: getFontFamily(),
            },
            breakpoints: {
                values: {
                    xs: 0,
                    sm: 600,
                    md: 1112,
                    lg: 1280,
                    xl: 1920,
                },
            },
            components: {
                MuiLink: { defaultProps: { underline: 'hover' } },
                MuiTab: {
                    styleOverrides: {
                        root: {
                            textTransform: 'unset',
                            padding: '0',
                            // up-sm
                            '@media screen and (min-width: 600px)': {
                                minWidth: 160,
                            },
                        },
                    },
                },
                MuiDialog: {
                    styleOverrides: {
                        paper: {
                            borderRadius: '12px',
                        },
                    },
                },
                MuiTypography: {
                    styleOverrides: {
                        root: {
                            fontSize: 14,
                        },
                    },
                },
            },
        },
        mode === 'dark'
            ? {
                  palette: {
                      mode: 'dark',
                      background: {
                          paper: grey[900],
                      },
                  },
                  components: {
                      MuiPaper: {
                          // https://github.com/mui-org/material-ui/pull/25522
                          styleOverrides: { root: { backgroundImage: 'unset' } },
                      },
                  },
              }
            : {},
        ...Object.values(Components).map(applyColors),
    ) as ThemeOptions

    return createTheme(theme)
    function applyColors(x: any) {
        if (typeof x === 'function') return x(mode, maskColors)
        return x
    }
}

export const MaskLightTheme = MaskTheme('light')
export const MaskDarkTheme = MaskTheme('dark')
