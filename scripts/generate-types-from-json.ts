import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const generateEnum = (
	obj: Record<string, unknown> | null,
	parent = '',
	finalObj: Record<string, string> = {},
) => {
	if (obj === null) return finalObj;
	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'object' && value !== null) {
			const currentKey = parent ? `${parent}_${key}` : key;
			generateEnum(value as Record<string, unknown>, currentKey, finalObj);
		} else if (key === 'value' && typeof value === 'string') {
			finalObj[parent.toUpperCase()] = value;
		}
	});
	return finalObj;
};

const generateTailwindEnum = (
	obj: object | null,
	parent = '',
	finalObj: Record<string, string> = {},
) => {
	if (obj === null) return finalObj;
	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'object' && value !== null) {
			const currentKey = parent ? `${parent}-${key}` : key;
			generateTailwindEnum(value, currentKey, finalObj);
		} else if (key === 'value' && typeof value === 'string') {
			const cleanedParent = parent.toLowerCase().replace(/^(bg|text)-/, '');
			finalObj[cleanedParent] = value;
		}
	});
	return finalObj;
};

const generateTailwindCSS = (
	obj: object | null,
	parent = '',
	finalObj: Record<string, string> = {},
) => {
	if (obj === null) return finalObj;
	Object.entries(obj).forEach(([key, value]) => {
		if (typeof value === 'object' && value !== null) {
			const currentKey = parent ? `${parent}-${key}` : key;
			generateTailwindCSS(value, currentKey, finalObj);
		} else if (key === 'value' && typeof value === 'string') {
			const cleanedParent = parent.toLowerCase().replace(/^(bg|text)-/, '');
			finalObj[cleanedParent] = value;
		}
	});
	return finalObj;
};

const generateTypeFile = async (config: {
	inputPath: string;
	outputPath: string;
	enumName: string;
	isTailwind: boolean;
}) => {
	const { inputPath, outputPath, enumName, isTailwind } = config;
	try {
		const jsonData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
		const enumObject = isTailwind
			? generateTailwindEnum(jsonData)
			: generateEnum(jsonData);
		const fileContent = `
/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 */
		
      export const ${enumName} = ${JSON.stringify(enumObject, null, 2)} ;

	  export type ${enumName}Type = (typeof ${enumName})[keyof typeof ${enumName}];
    `.trim();
		await fs.writeFile(outputPath, fileContent);
		console.log(`${outputPath} generated successfully`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error generating ${outputPath}: ${error.message}`);
		} else {
			console.error(`Error generating ${outputPath}: Unexpected error`);
		}
	}
};

const generateTailwindThemeFile = async (configs: typeof configsWithTheme) => {
	try {
		let themeContent = `
/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 */
@theme {`;

		for (const config of configs) {
			const jsonData = JSON.parse(await fs.readFile(config.inputPath, 'utf-8'));
			const variables = generateTailwindCSS(jsonData);

			// Group variables by type (colors, spacing, typography)
			themeContent += `\n  /* ${config.enumName} */\n`;
			Object.entries(variables).forEach(([key, value]) => {
				themeContent += `  --${config.prefix}-${key}: ${value};\n`;
			});
		}

		themeContent += `}\n`;

		await fs.writeFile(
			join(__dirname, '../src/tailwind-theme.css'),
			themeContent,
		);
		console.log('tailwind-theme.css generated successfully');
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error generating tailwind-theme.css: ${error.message}`);
		} else {
			console.error(`Error generating tailwind-theme.css: Unexpected error`);
		}
	}
};

const configsWithTheme = [
	{
		inputPath: join(__dirname, '../src/tokens/color.json'),
		outputPath: join(__dirname, '../src/types/Colors.ts'),
		enumName: 'Colors',
		isTailwind: true,
		prefix: 'color',
	},
	{
		inputPath: join(__dirname, '../src/tokens/spacing.json'),
		outputPath: join(__dirname, '../src/types/Spacing.ts'),
		enumName: 'Spacing',
		isTailwind: false,
		prefix: 'spacing',
	},
	{
		inputPath: join(__dirname, '../src/tokens/typography.json'),
		outputPath: join(__dirname, '../src/types/Typography.ts'),
		enumName: 'Typography',
		isTailwind: false,
		prefix: 'text',
	},
];

// Generate Color.ts and ColorTailwind.ts from color.json
const generateColorFiles = async () => {
	try {
		const colorJsonPath = join(__dirname, '../src/tokens/color.json');
		const jsonData = JSON.parse(await fs.readFile(colorJsonPath, 'utf-8'));

		// Generate Color.ts (with BG_ and TEXT_ prefixes)
		const colorEnum = generateEnum(jsonData);
		const colorFileContent = `
/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 */

export const Color = ${JSON.stringify(colorEnum, null, '\t')};

export type ColorType = (typeof Color)[keyof typeof Color];
`.trim();

		await fs.writeFile(
			join(__dirname, '../src/Colors/Color.ts'),
			colorFileContent,
		);
		console.log('src/Colors/Color.ts generated successfully');

		// Generate ColorTailwind.ts (kebab-case, lowercase)
		const tailwindEnum = generateTailwindEnum(jsonData);
		const tailwindFileContent = `
/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 */

export const ColorTailwind = ${JSON.stringify(tailwindEnum, null, '\t')};

export type ColorTailwindType =
	(typeof ColorTailwind)[keyof typeof ColorTailwind];
`.trim();

		await fs.writeFile(
			join(__dirname, '../src/Colors/ColorTailwind.ts'),
			tailwindFileContent,
		);
		console.log('src/Colors/ColorTailwind.ts generated successfully');
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error generating color files: ${error.message}`);
		} else {
			console.error(`Error generating color files: Unexpected error`);
		}
	}
};

// Generate Typography.ts from typography.json
const generateTypographyFile = async () => {
	try {
		const typographyJsonPath = join(__dirname, '../src/tokens/typography.json');
		const jsonData = JSON.parse(await fs.readFile(typographyJsonPath, 'utf-8'));

		// Generate Typography.ts (with all typography tokens)
		const typographyEnum = generateEnum(jsonData);
		const typographyFileContent = `
/**
 * Do not edit directly
 * Generated on ${new Date().toUTCString()}
 */

export const Typography = ${JSON.stringify(typographyEnum, null, '\t')};

export type TypographyType = (typeof Typography)[keyof typeof Typography];
`.trim();

		await fs.writeFile(
			join(__dirname, '../src/Typography/Typography.ts'),
			typographyFileContent,
		);
		console.log('src/Typography/Typography.ts generated successfully');
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error(`Error generating typography file: ${error.message}`);
		} else {
			console.error(`Error generating typography file: Unexpected error`);
		}
	}
};

(async () => {
	// Generate Color.ts and ColorTailwind.ts
	await generateColorFiles();

	// Generate Typography.ts
	await generateTypographyFile();

	// Generate TypeScript types
	for (const config of configsWithTheme) {
		await generateTypeFile(config);
	}

	// Generate Tailwind theme CSS
	await generateTailwindThemeFile(configsWithTheme);
})();
