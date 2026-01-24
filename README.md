# @signozhq/design-tokens

Welcome to the `@signozhq/design-tokens` package! This package provides a set of design tokens that can be used across your projects to maintain consistency in design and styling.

## Features

- **Design Tokens**: Easily manage and use design tokens for colors, spacing, and typography.
- **TypeScript Support**: Fully typed definitions for better development experience.
- **Tailwind Compatibility**: Generate tokens compatible with Tailwind CSS.
- **Build Tools**: Integrated with Vite for fast builds and development.

## Installation

To install the package, use npm or yarn:

```bash
npm install @signozhq/design-tokens
```

or

```bash
yarn add @signozhq/design-tokens
```

## Usage

You can import the design tokens in your project as follows:

### 1. Primitives

Direct access to raw values for colors, spacing, and typography.

```typescript
import { Color, Spacing, Typography } from '@signozhq/design-tokens';
// Example usage
const backgroundColor = Color.BG_ROBIN_100;
const color = Color.BG_ROBIN_500;
const padding = Spacing.PADDING_4;
const fontSize = Typography.FONTSIZE_BASE;
```

Additionally, you can import the generated CSS files that contain all the variables:

### 2. Semantic Tokens

The preferred way to style components using theme-aware tokens.

```typescript
import { Style } from '@signozhq/design-tokens';

// Returns the CSS variable string, e.g., "var(--background)"
const bg = Style.BACKGROUND;
const primary = Style.PRIMARY;
```

For **Tailwind CSS** (v3) configuration:

```typescript
import { StyleTailwind } from '@signozhq/design-tokens';

// In your tailwind.config.js
module.exports = {
	theme: {
		extend: {
			colors: StyleTailwind,
		},
	},
};
```

### 3. Composite Typography Styles

Apply full typography sets (font-family, size, weight, line-height) as a single object.

```typescript
import { TypographyStyles } from '@signozhq/design-tokens';

// Apply as an object in React
<p style={TypographyStyles.PARAGRAPH_MEDIUM_400}>Hello SigNoz</p>
```

---

## CSS & Theming

### Themes

Enable theme switching by importing the theme files and setting the `data-theme` attribute.

```html
<!-- Switch themes via data-theme attribute on <html> or <body> -->
<html data-theme="signoz">
	...
</html>
<!-- default -->
<html data-theme="blue">
	...
</html>
```

```css
/* Import themes */
@import '@signozhq/design-tokens/style.css';
@import '@signozhq/design-tokens/dist/themes/signoz-tokens.css';
@import '@signozhq/design-tokens/dist/themes/blue-tokens.css';
```

### Available Tokens

#### Colors

- `Color.BG_ROBIN_100`
- `Color.BG_SIENNA_200`
- `Color.TEXT_CHERRY_500`
- ... (and many more)

#### Spacing

- `Spacing.PADDING_1`
- `Spacing.MARGIN_4`
- ... (and many more)

#### Typography

- `Typography.FONTSIZE_SM`
- `Typography.FONTWEIGHT_BOLD`
- ... (and many more)

### Tailwind CSS v4

Native support for Tailwind v4 theme variables.

```css
@import '@signozhq/design-tokens/dist/tailwind-theme.css';
```

---

## Development

To regenerate tokens from JSON sources:

```bash
pnpm generate-tokens
```
