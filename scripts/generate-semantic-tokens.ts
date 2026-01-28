/**
 * Semantic Token Generator
 * Generates semantic tokens that map to primitive design tokens
 *
 * This script reads from src/tokens/semantic-tokens.json and generates
 * CSS files with semantic token definitions for multiple themes.
 *
 * It also generates a TypeScript definition file (Style.ts) for using tokens in code.
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Type definition for semantic token JSON structure
 */
interface ThemeMode {
	meta: {
		'color-scheme': 'light' | 'dark';
		selector?: string;
	};
	tokens: Record<string, string>;
}

interface SemanticTokens {
	[themeName: string]: {
		light: ThemeMode;
		dark: ThemeMode;
	};
}

/**
 * Convert tokens object to CSS variable format
 * Tokens are already in var(--...) format, just need to add -- prefix to keys
 */
function convertTokensToCSSFormat(
	tokens: Record<string, string>,
): Record<string, string> {
	const cssTokens: Record<string, string> = {};

	for (const [key, value] of Object.entries(tokens)) {
		const cssKey = `--${key}`;
		cssTokens[cssKey] = value;
	}

	return cssTokens;
}

/**
 * Generate token declarations for a given set of tokens
 */
function generateTokenDeclarations(
	tokens: Record<string, string>,
	indent: string = '\t',
): string {
	return Object.entries(tokens)
		.map(([key, value]) => `${indent}${key}: ${value};`)
		.join('\n');
}

/**
 * Get CSS selector for a theme mode
 */
function getSelector(themeName: string, mode: ThemeMode): string {
	// Use custom selector if provided
	if (mode.meta.selector) {
		return mode.meta.selector;
	}

	// Generate default selector for default theme
	if (themeName === 'default') {
		if (mode.meta['color-scheme'] === 'light') {
			return ":root,\n[data-theme='light']";
		}
		return ".dark,\n[data-theme='dark']";
	}

	// Generate default selector for named themes
	if (mode.meta['color-scheme'] === 'dark') {
		return `[data-theme='${themeName}'].dark`;
	}
	return `[data-theme='${themeName}']`;
}

/**
 * Generate CSS content for a specific theme
 */
function generateThemeCSS(
	themeName: string,
	theme: { light: ThemeMode; dark: ThemeMode },
): string {
	const timestamp = new Date().toUTCString();

	// Light mode
	const lightTokens = convertTokensToCSSFormat(theme.light.tokens);
	const lightSelector = getSelector(themeName, theme.light);
	const lightBlock = `${lightSelector} {
	color-scheme: ${theme.light.meta['color-scheme']};

${generateTokenDeclarations(lightTokens)}
}`;

	// Dark mode
	const darkTokens = convertTokensToCSSFormat(theme.dark.tokens);
	const darkSelector = getSelector(themeName, theme.dark);
	const darkBlock = `${darkSelector} {
	color-scheme: ${theme.dark.meta['color-scheme']};

${generateTokenDeclarations(darkTokens)}
}`;

	// Determine file header info
	const displayName =
		themeName === 'default'
			? 'Signoz'
			: themeName.charAt(0).toUpperCase() + themeName.slice(1);

	return `/**
 * ${displayName} Theme Tokens
 * DO NOT EDIT DIRECTLY - This file is auto-generated
 * Generated on ${timestamp}
 */

${lightBlock}

${darkBlock}
`;
}

/**
 * Generate TypeScript definitions for tokens
 */
function generateStyleDefinitions(tokens: Record<string, string>): string {
	const timestamp = new Date().toUTCString();

	const styleEntries = Object.entries(tokens).map(([key]) => {
		// Convert kebab-case to SCREAMING_SNAKE_CASE
		// e.g. muted-foreground -> MUTED_FOREGROUND
		const constantKey = key.toUpperCase().replace(/-/g, '_');
		return `	${constantKey}: "var(--${key})"`;
	});

	return `/**
 * Semantic Token Constants
 * DO NOT EDIT DIRECTLY - This file is auto-generated
 * Generated on ${timestamp}
 */

export const Style = {
${styleEntries.join(',\n')}
} as const;

export type StyleType = typeof Style;
`;
}

/**
 * Generate Tailwind config definitions for tokens
 */
function generateStyleTailwindDefinitions(
	tokens: Record<string, string>,
): string {
	const timestamp = new Date().toUTCString();

	const styleEntries = Object.entries(tokens).map(([key]) => {
		// Use kebab-case keys as they appear in the JSON
		return `	'${key}': 'var(--${key})'`;
	});

	return `/**
 * Semantic Token Tailwind Config
 * DO NOT EDIT DIRECTLY - This file is auto-generated
 * Generated on ${timestamp}
 */

export const StyleTailwind = {
${styleEntries.join(',\n')}
} as const;

export type StyleTailwindType = (typeof StyleTailwind)[keyof typeof StyleTailwind];
`;
}

/**
 * Main function to generate semantic token files
 */
async function generateSemanticTokens(): Promise<void> {
	const themesDir = join(__dirname, '../src/themes');
	const typesDir = join(__dirname, '../src/types');
	const tokensPath = join(__dirname, '../src/tokens/semantic-tokens.json');

	try {
		// Ensure types and themes directories exist
		await fs.mkdir(typesDir, { recursive: true });
		await fs.mkdir(themesDir, { recursive: true });

		// Read and parse the JSON file
		const jsonContent = await fs.readFile(tokensPath, 'utf-8');
		const tokensData: SemanticTokens = JSON.parse(jsonContent);

		// 1. Generate separate CSS files for each theme in themes directory
		for (const [themeName, themeData] of Object.entries(tokensData)) {
			// Map 'default' to 'signoz-tokens.css', others to '[name]-tokens.css'
			const outputName = themeName === 'default' ? 'signoz' : themeName;
			const fileName = `${outputName}-tokens.css`;
			const cssPath = join(themesDir, fileName);

			const cssContent = generateThemeCSS(themeName, themeData);
			await fs.writeFile(cssPath, cssContent);
			console.log(`✓ Generated themes/${fileName}`);
		}

		// 2. Generate TypeScript definitions (Style.ts and StyleTailwind.ts)
		// Use 'default' theme tokens as source of truth for keys
		const defaultTheme = tokensData['default'];
		if (defaultTheme) {
			// Generate Style.ts
			const styleContent = generateStyleDefinitions(defaultTheme.light.tokens);
			const stylePath = join(typesDir, 'Style.ts');
			await fs.writeFile(stylePath, styleContent);
			console.log(`✓ Generated types/Style.ts`);

			// Generate StyleTailwind.ts
			const styleTailwindContent = generateStyleTailwindDefinitions(
				defaultTheme.light.tokens,
			);
			const styleTailwindPath = join(typesDir, 'StyleTailwind.ts');
			await fs.writeFile(styleTailwindPath, styleTailwindContent);
			console.log(`✓ Generated types/StyleTailwind.ts`);
		} else {
			console.warn('⚠️ No default theme found, skipping Style.ts generation');
		}

		console.log(`\n✅ Semantic tokens generated successfully!`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`❌ Error generating semantic tokens: ${error.message}`);
		} else {
			console.error(`❌ Error generating semantic tokens: Unknown error`);
		}
		process.exit(1);
	}
}

// Run the generator
generateSemanticTokens();
