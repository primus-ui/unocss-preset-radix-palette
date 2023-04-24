import type { TPalette, IPresetRadixPaletteOptions } from './types'
import type { Preset } from 'unocss'
import * as Colors from '@radix-ui/colors'
import { defaultPalette, getPalette } from './utils'

export function presetRadix<T>(
  options: IPresetRadixPaletteOptions = {
    palette: defaultPalette(),
    prefix: '--',
    extends: true,
    light: ':root',
    dark: '.dark',
    media: false,
    preflights: true
  }
): Preset<T> {
  if (
    typeof options.palette !== 'object' ||
    Object.keys(options.palette).length === 0
  ) {
    options.palette = defaultPalette()
  }
  options.prefix = typeof options.prefix !== 'string' ? '--' : options.prefix
  options.light =
    options.light === false || typeof options.light === 'string'
      ? options.light
      : ':root'
  options.dark =
    options.dark === false || typeof options.dark === 'string'
      ? options.dark
      : '.dark'
  options.media =
    typeof options.media === 'string' &&
    ['dark', 'light'].includes(options.media)
      ? options.media
      : false
  if (
    typeof options.preflights !== 'boolean' &&
    options.preflights !== '*' &&
    !Array.isArray(options.preflights)
  ) {
    options.preflights = true
  }

  // Adjust prefix, so we can just set prefix with a single word like 'color'
  // 1) Fix when prefix missing '--'
  // 2) Separate prefix with color name, e.g. change '--color' to '--color-'
  if (!options.prefix.startsWith('--')) {
    // 1
    options.prefix =
      options.prefix[0] === '-' ? `-${options.prefix}` : `--${options.prefix}`
  }

  if (!options.prefix.endsWith('-')) {
    // 2
    options.prefix = `${options.prefix}-`
  }

  const colors: { [key: string]: TPalette } = {}

  const genCss = {
    dark: [],
    light: []
  }

  const pushPreflights = (colorName, colorAlias, alpha, mode, step) => {
    const css = `${options.prefix}${colorAlias}${alpha ? 'A' : ''}${step}: ${
      Colors[`${colorName}${mode === 'dark' ? 'Dark' : ''}${alpha ? 'A' : ''}`][
        `${colorName}${alpha ? 'A' : ''}${step}`
      ]
    };`

    if (!genCss[mode].includes(css)) genCss[mode].push(css)
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
          pushPreflights(color, alias, false, 'light', step) // Light
          pushPreflights(color, alias, true, 'light', step) // Light alpha
          pushPreflights(color, alias, true, 'dark', step) // Dark alpha
          pushPreflights(color, alias, false, 'dark', step) // Dark
        } else {
          const css = `${options.prefix}${alias}A${step}: ${
            Colors[`${color}`][`${color}${step}`]
          };`
          if (!genCss.light.includes(css)) genCss.light.push(css)
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
        ([_selector, _prop, alias, alpha, scale]) => {
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
            return {}
          }

          const darkPalette = alpha ? `${color}DarkA` : `${color}Dark`
          const variableName = alpha ? `${alias}A${scale}` : `${alias}${scale}`

          if (Colors[palette] && Colors[palette][`${palette}${scale}`]) {
            const css = `${options.prefix}${variableName}: ${
              Colors[palette][`${palette}${scale}`]
            };`
            if (!genCss.light.includes(css)) genCss.light.push(css)

            // If dark color exists and it's not overlay
            if (
              !isOverlay(color) &&
              Colors[palette] &&
              Colors[darkPalette][`${palette}${scale}`]
            ) {
              const css = `${options.prefix}${variableName}: ${
                Colors[darkPalette][`${palette}${scale}`]
              };`
              if (!genCss.dark.includes(css)) genCss.dark.push(css)
            }

            return {}
          }
        }
      ]
    ],
    preflights: [
      {
        getCSS: () => {
          return `
          ${
            options.light === false || genCss.light.length === 0
              ? ''
              : `${options.light} {
            ${genCss.light
              .sort((a, b) =>
                ('' + a).localeCompare(b, 'en', { numeric: true })
              )
              .join('\n')}
          }`
          }
          
          ${
            options.dark === false || genCss.dark.length === 0
              ? ''
              : `${options.dark} {
            ${genCss.dark
              .sort((a, b) =>
                ('' + a).localeCompare(b, 'en', { numeric: true })
              )
              .join('\n')}
          }`
          }
                    
          ${
            options.media === false || genCss.dark.length === 0
              ? ''
              : `@media (prefers-color-scheme: ${options.media}) {
                  ${
                    options.media === 'dark'
                      ? options.light || ':root'
                      : options.dark || ':root'
                  } {
                    ${(options.media === 'dark' ? genCss.dark : genCss.light)
                      .sort((a, b) =>
                        ('' + a).localeCompare(b, 'en', { numeric: true })
                      )
                      .join('\n')}
                  }
              }`
          }
          `
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
  } as Preset<T>
}
