import { IPresetRadixPaletteOptions, TPalette } from './types'
import * as Colors from '@radix-ui/colors'

/**
 * Default options palette when not providing one via options.
 * @return {object} - Default 'options.palette' with alias as key and color name as value
 */
export const defaultPalette = (): IPresetRadixPaletteOptions['palette'] => {
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
