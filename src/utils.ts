import { IPresetRadixPaletteOptions, TPalette } from './types'
import * as Colors from '@radix-ui/colors'

/**
 * Default options palette when not providing one via options.
 * @return {object} - Default 'options.palette' with alias as key and color name as value
 */
export const getDefaultPalette = (): IPresetRadixPaletteOptions['palette'] => {
  return Object.keys(Colors).reduce((palette, color) => {
    if (!color.includes('Dark') && !color.includes('A')) palette[color] = color
    return palette
  }, {})
}

/**
 * Return palette object with step (1-12) as key
 * and CSS var (e.g. var(--blue6)) as value
 * @param {string} color - The radix color name
 * @param {string} alias - The alias of color name
 * @param {string} prefix - The CSS var prefix
 * @return {object} - The palette object with step (1-12) as key and CSS var as value
 */
export const getPalette = (color, alias, prefix): TPalette => {
  // Convert color keys from 'blue2' to '2'
  const name = (c): string => c.replace(color.replace('Dark', ''), '')

  // Return CSS variable name (e.g. --blue1 or blueA1)
  const val = (i) => `${prefix}${color.endsWith('A') ? `${alias}A` : alias}${i}`

  return Object.keys(Colors[color]).reduce((palette, color, i) => {
    palette[name(color)] = `var(${val(++i)})`
    return palette
  }, {})
}

export const getPreflightCss = (selector, css) => {
  return selector === false || css.length === 0
    ? ''
    : `${selector} {
      ${css
        .sort((a, b) => ('' + a).localeCompare(b, 'en', { numeric: true }))
        .join('\n')}
    }`
}

export const validateOptions = (options: IPresetRadixPaletteOptions) => {
  if (
    typeof options.palette !== 'object' ||
    Object.keys(options.palette).length === 0
  ) {
    options.palette = getDefaultPalette()
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

  return options
}
