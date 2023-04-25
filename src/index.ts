import type { TPalette, IPresetRadixPaletteOptions } from './types'
import type { Preset } from 'unocss'
import * as Colors from '@radix-ui/colors'
import {
  getDefaultPalette,
  getPalette,
  getPreflightCss,
  validateOptions
} from './utils'

export function presetRadix(
  options: IPresetRadixPaletteOptions = {
    palette: getDefaultPalette(),
    prefix: '--',
    extends: true,
    light: ':root',
    dark: '.dark',
    media: false,
    preflights: true
  }
): Preset {
  options = validateOptions(options)

  const colors: { [key: string]: TPalette } = {}

  const preflightCss = {
    dark: [],
    light: []
  }

  const pushPreflight = (mode, css) => {
    if (!preflightCss[mode].includes(css)) preflightCss[mode].push(css)
  }

  const preparePreflight = (colorName, colorAlias, alpha, mode, step) => {
    const css = `${options.prefix}${colorAlias}${alpha ? 'A' : ''}${step}: ${
      Colors[`${colorName}${mode === 'dark' ? 'Dark' : ''}${alpha ? 'A' : ''}`][
        `${colorName}${alpha ? 'A' : ''}${step}`
      ]
    };`

    pushPreflight(mode, css)
  }

  // When preflights is (*) or an array which include the color then we push the palette
  const isPreflight = (alias) =>
    options.preflights === '*' ||
    (Array.isArray(options.preflights) && options.preflights.includes(alias))

  const isOverlay = (color) => ['whiteA', 'blackA'].includes(color)

  // Used to create regex
  const aliasKeys = []

  for (const alias in options.palette) {
    const color = options.palette![alias]

    // Skip if colors is unknown or if is dark/alpha except whiteA/blackA
    if (
      !(color in Colors) ||
      (!isOverlay(color) && (color.includes('Dark') || color.includes('A')))
    ) {
      delete options.palette![alias]
      continue
    }

    aliasKeys.push(alias)
    aliasKeys.push(`${alias}A`)

    if (!isOverlay(color)) {
      colors[alias] = getPalette(color, alias, options.prefix)
      colors[`${alias}A`] = getPalette(`${color}A`, alias, options.prefix)
    } else {
      colors[`${alias}A`] = getPalette(color, alias, options.prefix)
    }

    // When preflights is (*) or an array which include the color then we push the palette
    if (isPreflight(alias)) {
      for (let step = 1; step <= 12; step++) {
        if (!isOverlay(color)) {
          preparePreflight(color, alias, false, 'light', step) // Light
          preparePreflight(color, alias, true, 'light', step) // Light alpha
          preparePreflight(color, alias, true, 'dark', step) // Dark alpha
          preparePreflight(color, alias, false, 'dark', step) // Dark
        } else {
          pushPreflight(
            'light',
            `${options.prefix}${alias}A${step}: ${
              Colors[`${color}`][`${color}${step}`]
            };`
          )
        }
      }
    }
  }

  // Remove empty, ie when provided invalid colors names
  for (const c in colors) {
    if (!c || Object.keys(colors[c]).length === 0) {
      delete colors[c]
    }
  }

  // With this regex we can preflight css vars when we found a match
  // The regex match for '(anything)-(color-name)-(1-12)'
  // When we found a match, we push in preflights array the colors, which then is output by preflights getCSS()
  const regexColors = new RegExp(
    `^(.+)-(${aliasKeys.join('|')})-(a)?([1-9]|1[0-2])$`
  )

  return {
    name: 'preset-radix',
    layers: {
      radix: -1
    },
    extendTheme(theme: { [key: string]: any }) {
      if (options.extends) {
        theme.colors = { ...theme.colors, ...colors }
      } else {
        theme.colors = {
          ...colors,
          white: 'white',
          black: 'black',
          transparent: 'transparent',
          current: 'currentColor',
          inherit: 'inherit'
        }
      }
    },
    rules: [
      // Radix colors
      [
        regexColors,
        ([_selector, _prop, alias, alpha, scale]: string[]): undefined => {
          // Since unocss colors works like .bg-colorName and .bg-color-name
          // e.g. .bg-blue-a1 will works also as .bg-blueA-1
          if (alias.endsWith('A')) {
            alpha = 'a'
            alias = alias.slice(0, -1)
          }

          // console.log({ _selector, _prop, alias, alpha, scale })

          const color = options.palette![alias]
          const palette = alpha && !isOverlay(color) ? `${color}A` : color

          // Check if preflights is enabled or if is an array which doesn't include this color
          if (options.preflights === false || isPreflight(alias)) {
            return
          }

          const darkPalette = alpha ? `${color}DarkA` : `${color}Dark`
          const variableName = alpha ? `${alias}A${scale}` : `${alias}${scale}`

          if (Colors[palette] && Colors[palette][`${palette}${scale}`]) {
            pushPreflight(
              'light',
              `${options.prefix}${variableName}: ${
                Colors[palette][`${palette}${scale}`]
              };`
            )

            // If dark color exists and it's not overlay
            if (
              !isOverlay(color) &&
              Colors[palette] &&
              Colors[darkPalette][`${palette}${scale}`]
            ) {
              pushPreflight(
                'dark',
                `${options.prefix}${variableName}: ${
                  Colors[darkPalette][`${palette}${scale}`]
                };`
              )
            }

            return
          }
        }
      ]
    ],
    preflights: [
      {
        layer: 'radix',
        getCSS: () => {
          const output = []
          output.push(getPreflightCss(options.light, preflightCss.light))
          output.push(getPreflightCss(options.dark, preflightCss.dark))

          const selector =
            options.media === 'dark'
              ? options.light || ':root'
              : options.dark || ':root'

          const css =
            options.media === 'dark' ? preflightCss.dark : preflightCss.light

          output.push(`
            ${
              options.media === false ||
              (options.media === 'dark' && preflightCss.dark.length === 0) ||
              (options.media === 'light' && preflightCss.light.length === 0)
                ? ''
                : `@media (prefers-color-scheme: ${options.media}) {
                    ${getPreflightCss(selector, css)}
                }`
            }
          `)

          return output.join('\n')
        }
      }
    ],
    variants: [
      /* ... */
    ],
    shortcuts: [
      /* ... */
    ]
    // ...
  }
}
