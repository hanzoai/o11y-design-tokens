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
		outputPath: join(__dirname, '../src/types/colors.ts'),
		enumName: 'colors',
		isTailwind: true,
		prefix: 'color',
	},
	{
		inputPath: join(__dirname, '../src/tokens/spacing.json'),
		outputPath: join(__dirname, '../src/types/spacing.ts'),
		enumName: 'spacing',
		isTailwind: false,
		prefix: 'spacing',
	},
	{
		inputPath: join(__dirname, '../src/tokens/typography.json'),
		outputPath: join(__dirname, '../src/types/typography.ts'),
		enumName: 'typography',
		isTailwind: false,
		prefix: 'text',
	},
];

(async () => {
	// Generate TypeScript types
	for (const config of configsWithTheme) {
		await generateTypeFile(config);
	}

	// Generate Tailwind theme CSS
	await generateTailwindThemeFile(configsWithTheme);
})();
