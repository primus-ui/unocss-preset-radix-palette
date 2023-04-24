import { describe, expect, it } from 'vitest'
import { createGenerator } from '@unocss/core'
import presetMini from '@unocss/preset-mini'
import { presetRadix } from '../src'
import { IPresetRadixPaletteOptions } from '../src/types'

/**
 * Example options
 *
 * {
 *   palette: {
 *     alias: 'radix-color-name',
 *   },
 *   extends: true, // Extends theme colors or override
 *   prefix: '--color-', // CSS variables prefix
 *   dark: '.dark', // Dark selector
 *   light: ':root, .light', // Light selector
 *   preflights: true // Preflights CSS color variables (true | false | '*' | [array of colors])
 * }
 */

/**
 * Example test
 *
 *  it('should create new test', async () => {
 *     // Given
 *     const classes = []
 *     const options: IPresetRadixPaletteOptions = {}
 *
 *     // When
 *     const { css } = await uno(classes, options)
 *
 *     // Then
 *     await expect(format(css)).toMatchFileSnapshot(snapshot('test'))
 *  })
 */

describe('options palette', () => {
  it('should generate colors with default palette', async () => {
    // Given
    const classes = [
      'bg-blue-',
      'bg-blue-a2',
      'bg-red-3',
      'text-blue-10',
      'text-blue-a5',
      'text-blue-a9'
    ]

    // When
    const { css } = await uno(classes)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
  it('should generate colors with custom palette', async () => {
    // Given
    const options: IPresetRadixPaletteOptions = {
      palette: {
        brand: 'blue',
        neutral: 'slate',
        red: 'tomato',
        green: 'green',
        overlay: 'blackA'
      }
    }
    const classes = [
      'bg-brand-6',
      'bg-brand-a2',
      'bg-neutral-3',
      'bg-red-3',
      'bg-green-7',
      'bg-overlay-a9',
      'bg-blue-12',
      'bg-slate-500', // Default colors should work
      'text-brand-10',
      'text-red-a5',
      'text-green-a9',
      'text-neutral-12',
      'text-blue-2',
      'text-slate-500' // Default colors should work
    ]

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

describe('options extends', () => {
  it('should override default theme colors', async () => {
    // Given
    const classes = [
      'bg-slate-500', // This should not exist
      'bg-slate-5', // This should exist
      'text-slate-500', // This should not exist
      'text-slate-5' // This should exist
    ]
    const options: IPresetRadixPaletteOptions = {
      extends: false
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

describe('options prefix', () => {
  it('should use css variable custom prefix', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      prefix: '--color-'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should fix css variable custom prefix', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      prefix: 'color' // Missed prefix '--' and suffix '-' will be added
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

describe('options dark/light', () => {
  it('should use custom dark selectors', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: '.dark-theme'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should use custom light selectors', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      light: ':root, .light-theme'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should use custom dark and light selectors', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: '.dark-theme',
      light: ':root, .light-theme'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should make dark default', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: ':root',
      light: '.light'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should disable dark mode', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: false
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should disable light mode', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      light: false,
      dark: ':root' // Dark become default, so it must be :root or similar
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

describe('options media', () => {
  it('should use media prefers-color-scheme', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      media: 'dark' // Add additional media prefers-color-scheme in addition to .dark and :root
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should use only media prefers-color-scheme and disable dark mode', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: false,
      media: 'dark'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should use media prefers-color-scheme light', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: ':root', // Default dark
      light: '.light', // Optionally add or disable (see next test)
      media: 'light' // Light via media prefers-color-scheme
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should use only media prefers-color-scheme light and disable light mode', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      dark: ':root', // Default dark
      light: false,
      media: 'light' // Light via media prefers-color-scheme
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

describe('options preflights', () => {
  it('should disable preflights', async () => {
    // Given
    const classes = ['bg-blue-10', 'text-green-7']
    const options: IPresetRadixPaletteOptions = {
      preflights: false
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should preflights all CSS variables in palette', async () => {
    // Given
    const classes = ['bg-brand-1', 'text-brand-2']
    const options: IPresetRadixPaletteOptions = {
      palette: {
        brand: 'blue',
        neutral: 'slate',
        red: 'tomato',
        green: 'green',
        overlay: 'blackA'
      },
      preflights: '*'
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })

  it('should preflights CSS variables in preflights array', async () => {
    // Given
    const classes = ['bg-brand-1', 'text-brand-2']
    const options: IPresetRadixPaletteOptions = {
      palette: {
        brand: 'blue',
        neutral: 'slate',
        red: 'tomato',
        green: 'green',
        overlay: 'blackA'
      },
      preflights: ['brand', 'neutral', 'overlay']
    }

    // When
    const { css } = await uno(classes, options)

    // Then
    await expect(format(css)).toMatchFileSnapshot(snapshot(expect.getState()))
  })
})

function uno(classes, options: IPresetRadixPaletteOptions = {}) {
  return createGenerator({
    presets: [
      presetMini({
        preflights: false // This seems doesn't work
      }),
      presetRadix(options)
    ]
  }).generate(Array.from(classes).join(' '))
}

function snapshot(s) {
  if (typeof s !== 'string') {
    s = s.currentTestName.split(' > ').pop().replace(/\s+/g, '-').toLowerCase()
  }

  return `./snapshot/${s}.css`
}

function format(css) {
  return css
    .split('\n')
    .map((c) => c.trim())
    .join('\n')
    .replace(defaultPreflights(), '')
}

// When we disable preflights via presetMini then is still loading preflights
// while when we disable preflights via uno.generate then it remove also presetRadix preflights.
// As temp workaround we remove it before match.
function defaultPreflights() {
  return `*,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);}`
}
