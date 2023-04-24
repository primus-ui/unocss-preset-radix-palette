# UnoCSS Preset for Radix UI Colors Palette

This is the [UnoCSS](https://unocss.dev/) preset for [Radix UI Colors Palette](https://www.radix-ui.com/colors).
The tests cover more than 90% of the source code.
That being said, consider that this preset is still in its early stages.
I created it not only for personal needs, but also to practice with UnoCSS.
As an alternative consider also [this preset](https://github.com/endigma/unocss-preset-radix).
It's works well, but it's missing some features that I needed.
I try to work on that existing preset but in the end it was better for my need to create a new one.

Find below a list of features and example of usage.
In case you may need check `tests` folder.

## Options

By default, the preset doesn't require any configuration, and works with defined options.

If comments below are not clear, each one of the options will be explained in next sections.

```js
import { presetRadix } from './preset-radix'
import { defineConfig, presetMini } from 'unocss'

export default defineConfig({
  presets: [
    presetMini(),
    // It's fine to just call the main preset function
    // presetRadix()

    // Or change default options as show below
    presetRadix({
      // The palette is an object with
      // color alias as key and color name as value
      // By default will set all colors in theme.colors
      // This will NOT add anything in the output CSS
      // but just make available the colors to be used with
      // classes such as bg-brand-7 or text-neutral-10
      palette: {
        brand: 'blue',
        neutral: 'slate',
        overlay: 'blackA',
        red: 'tomato',
        green: 'green'
      },
      // CSS variable prefix, default will be e.g. var(--blue)
      prefix: '--',
      // Extends default theme.colors or override default theme.colors
      extends: true,
      // Change light mode selector, or set to 'false' for disable light mode
      light: ':root',
      // Change dark mode selector or set to 'false' to disable dark mode
      dark: '.dark',
      // Enable media prefers-color-mode
      // Change to 'dark' or 'light'
      media: false,
      // When enabled the CSS variables will be added in the light and dark
      // selector on demand, when disable you have to add them manually.
      // Another options is to set '*' to preflights all colors in palette immediately.
      // This is useful if you are using the colors in your CSS without color utility.
      // Or pass an array of colors that you want to preflights immediately.
      preflights: true
    })
  ]
})
```

## Options palette

The palette options allow to set the colors that you wish to use, and allow to change
the color name. When you don't set this options, then all colors from Radix palette
are available to be used. They are not added in output CSS until you use them.

```js
presetRadix({
  palette: {
    brand: 'blue',
    neutral: 'slate',
    overlay: 'blackA',
    red: 'tomato',
    green: 'green'
  }
})
```

You don't need to add dark colors here, nor the alpha colors (apart `whiteA` and `blackA` which are available only with alpha).
When you add one colors, for example `blue` then also dark and alpha colors
are available.

With above options you can use your colors like shown below:

```html
<div class="bg-brand-8 text-neutral-2">
  blue 8 background with slate 2 color
</div>
```

```html
<div class="bg-brand-a8 text-neutral-a2">
  blue alpha 8 background with slate alpha 2 color
</div>
```

## Options prefix

You can change the prefix of CSS variables as shown below:

```js
presetRadix({
  prefix: '--color-'
})
// You can also just set the word and the
// prefix '--' and suffix '-' will be added
presetRadix({
  prefix: 'color'
})
```

## Options extends

You can change override default theme colors and use only the Radix colors,
or you can keep the default theme colors together with Radix colors.

```js
// Keep default theme colors
presetRadix({
  extends: true
})
// Override default theme colors
presetRadix({
  extends: false
})
```

## Options light and dark selector

You can change the default dark and light selector as shown below.

```js
presetRadix({
  dark: '.dark-theme',
  light: ':root, .light-theme'
})
```

If you want you can also disable dark or light mode, of course you have to keep one or another.

```js
// Keep default theme colors
presetRadix({
  dark: false, // Will disable dark
  light: false // Will disable light
})
```

## Options media

You can also enable media prefers-colors-scheme in addition to dark and light selector.

For example below options:

```js
presetRadix({
  dark: false, // Disable dark mode via dark selector
  mode: 'dark'
})
```

Will output dark CSS variables like shown below:

```css
/* Light colors by default */
:root {
  --blue10: hsl(208, 100%, 47.3%);
  --green7: hsl(146, 38.5%, 69%);
}

/* Dark colors via media prefers-color-scheme */
@media (prefers-color-scheme: dark) {
  :root {
    --blue10: hsl(209, 100%, 60.6%);
    --green7: hsl(153, 51.8%, 21.8%);
  }
}
```

While below example:

```js
presetRadix({
  dark: ':root', // Keep dark mode default
  light: false, // Disable light mode selector
  mode: 'light' // Use media prefers-colors-scheme for light mode
})
```

While output dark CSS variables like shown below:

```css
/* Dark colors by default */
:root {
  --blue10: hsl(209, 100%, 60.6%);
  --green7: hsl(153, 51.8%, 21.8%);
}

/* Light colors via media prefers-color-scheme */
@media (prefers-color-scheme: light) {
  :root {
    --blue10: hsl(208, 100%, 47.3%);
    --green7: hsl(146, 38.5%, 69%);
  }
}
```

## Options preflights

By default, the CSS variables will be added in output CSS only when they are being used,
so on demand following the UnoCSS principle.

But sometimes you may whish to have the CSS variables as being used outside UnoCSS,
or sometimes you already have another mechanism to load the CSS variables.

This options cover all this scenario.

First you can disable all preflights:

```js
presetRadix({
  preflights: false // Will not add any CSS variables
})
```

Then you can preflights all CSS variables from `options.palette` immediately:

```js
presetRadix({
  preflights: '*' // Will preflights all CSS variables defined in options.palette
})
```

Last you can preflights some of CSS variables from `options.palette` immediately:

```js
presetRadix({
  preflights: ['brand', 'neutral'] // Will preflights only brand and neutral
})
```

Preflights load also dark colors if enabled and alpha colors.
So for each color you add here, the output will be 48 variables:
12 for normal colors, 12 for alpha, 12 for dark and 12 for dark alpha.

Consider this if you wish to enable preflights immediately either with '\*' or using an array of colors.

The best way is to set this options to `true` so that only the used
colors will be added as CSS variables.
