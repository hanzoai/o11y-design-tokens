/**
 * Typography Style Generator
 * Generates composite typography styles that apply multiple properties together
 *
 * This script reads from src/tokens/typography-styles.json and generates:
 * 1. CSS classes with all typography properties combined
 * 2. TypeScript constants for easy consumption in React/TS projects
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TypographyStyle {
	fontSize: string;
	fontWeight: string;
	lineHeight: string;
	letterSpacing: string;
	fontFamily: string;
}

interface TypographyGroup {
	[weight: string]: TypographyStyle;
}

interface TypographyCategory {
	[size: string]: TypographyGroup;
}

interface TypographyStyles {
	[category: string]: TypographyCategory;
}

/**
 * Generate CSS class for a typography style
 */
function generateCSSClass(
	category: string,
	size: string,
	weight: string,
	props: TypographyStyle,
): string {
	const className = `.typography-${category}-${size}-${weight}`;
	return `${className} {
	font-family: ${props.fontFamily};
	font-size: ${props.fontSize};
	font-weight: ${props.fontWeight};
	line-height: ${props.lineHeight};
	letter-spacing: ${props.letterSpacing};
}`;
}

/**
 * Generate TypeScript constant name
 */
function generateConstantName(
	category: string,
	size: string,
	weight: string,
): string {
	return `${category.toUpperCase()}_${size.toUpperCase()}_${weight}`;
}

/**
 * Generate TypeScript constant value (CSS properties object)
 */
function generateConstantValue(props: TypographyStyle): string {
	return `{
		fontFamily: '${props.fontFamily}',
		fontSize: '${props.fontSize}',
		fontWeight: '${props.fontWeight}',
		lineHeight: '${props.lineHeight}',
		letterSpacing: '${props.letterSpacing}',
	}`;
}

/**
 * Main generation function
 */
async function generateTypographyStyles(): Promise<void> {
	const tokensPath = join(__dirname, '../src/tokens/typography-styles.json');
	const cssOutputPath = join(
		__dirname,
		'../src/Typography/typography-styles.css',
	);
	const tsOutputPath = join(__dirname, '../src/Typography/TypographyStyles.ts');

	try {
		// Read typography styles
		const jsonContent = await fs.readFile(tokensPath, 'utf-8');
		const styles: TypographyStyles = JSON.parse(jsonContent);

		const cssClasses: string[] = [];
		const tsConstants: string[] = [];

		// Process all categories
		for (const [category, categoryData] of Object.entries(styles)) {
			for (const [size, sizeData] of Object.entries(categoryData)) {
				for (const [weight, props] of Object.entries(sizeData)) {
					// Generate CSS class
					cssClasses.push(generateCSSClass(category, size, weight, props));

					// Generate TypeScript constant
					const constantName = generateConstantName(category, size, weight);
					const constantValue = generateConstantValue(props);
					tsConstants.push(`\t${constantName}: ${constantValue}`);
				}
			}
		}

		// Generate CSS file
		const timestamp = new Date().toUTCString();
		const cssContent = `/**
 * Typography Styles
 * DO NOT EDIT DIRECTLY - This file is auto-generated
 * Generated on ${timestamp}
 *
 * These classes apply complete typography styles including:
 * font-family, font-size, font-weight, line-height, letter-spacing
 *
 * Usage in HTML:
 * <p class="typography-paragraph-medium-400">Your text here</p>
 *
 * Usage in CSS:
 * .my-element {
 *   @apply typography-label-base-600;
 * }
 */

${cssClasses.join('\n\n')}
`;

		await fs.writeFile(cssOutputPath, cssContent);
		console.log(`✓ Generated Typography/typography-styles.css`);

		// Generate TypeScript file
		const tsContent = `/**
 * Typography Styles
 * DO NOT EDIT DIRECTLY - This file is auto-generated
 * Generated on ${timestamp}
 *
 * Use these constants to apply complete typography styles in your components
 *
 * Usage in React:
 * import { TypographyStyles } from '@signoz/design-tokens';
 *
 * <p style={TypographyStyles.PARAGRAPH_MEDIUM_400}>Your text here</p>
 */

export interface TypographyStyle {
	fontFamily: string;
	fontSize: string;
	fontWeight: string;
	lineHeight: string;
	letterSpacing: string;
}

export const TypographyStyles = {
${tsConstants.join(',\n')}
} as const;

export type TypographyStylesType = typeof TypographyStyles;
export type TypographyStyleName = keyof typeof TypographyStyles;
`;

		await fs.writeFile(tsOutputPath, tsContent);
		console.log(`✓ Generated Typography/TypographyStyles.ts`);

		console.log(`\n✅ Typography styles generated successfully!`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`❌ Error generating typography styles: ${error.message}`);
		} else {
			console.error(`❌ Error generating typography styles: Unknown error`);
		}
		process.exit(1);
	}
}

// Run the generator
generateTypographyStyles();
