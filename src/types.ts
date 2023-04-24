import * as Colors from '@radix-ui/colors'

export type TRadixColors = typeof Colors

// Type radix colors without dark and alpha
export type TRadixColorsWithoutSuffix = keyof Omit<
  TRadixColors,
  `${keyof TRadixColors}${'Dark' | 'DarkA' | 'A'}`
>

export interface IPresetRadixPaletteOptions {
  // Palette { alias: 'blue' }
  palette?: Record<string, TRadixColorsWithoutSuffix>
  prefix?: string
  extends?: boolean
  // Dark mode selector, optionally disable if you want
  // to use only media prefers-color-scheme or do not want to use dark mode
  dark?: string | false
  light?: string | false
  // Enable media prefers-color-scheme for dark mode
  // Set default media 'dark' or 'light' or disable with false
  media?: 'dark' | 'light' | false
  // true: add css var on demand (default)
  // false: add manually
  // *: add all from palette immediately
  // ['blue', 'green', ...]: array of colors names to preflight immediately, and others on demand
  preflights?: boolean | '*' | string[]
}

export type TPalette = {
  [
    key:
      | '1'
      | '2'
      | '3'
      | '4'
      | '5'
      | '6'
      | '7'
      | '8'
      | '9'
      | '10'
      | '11'
      | '12'
  ]: string
}
