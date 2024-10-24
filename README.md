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

```typescript
import { Color, Spacing, Typography } from '@signozhq/design-tokens';
// Example usage
const backgroundColor = Color.BG_ROBIN_100;
const padding = Spacing.PADDING_4;
const fontSize = Typography.FONTSIZE_XL;
```

Additionally, you can import the generated CSS files that contain all the variables:

```css
@import '@signozhq/design-tokens/style.css';
```

Or import specific files for colors, spacing, or typography:

```css
@import '@signozhq/design-tokens/src/Colors/colors.css';
@import '@signozhq/design-tokens/src/Spacing/spacing.css';
@import '@signozhq/design-tokens/src/Typography/typography.css';
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

## Generating Tokens

To generate the design tokens from JSON files, you can run the following command:

```bash
npm run generate-tokens
```

This will read the JSON files located in the `src/tokens` directory and generate the corresponding TypeScript files.

## Changelog

For a detailed list of changes, please refer to the [CHANGELOG.md](CHANGELOG.md).
