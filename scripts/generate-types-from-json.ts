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
		
      export const ${enumName} = ${JSON.stringify(enumObject, null, 2)} as const;

	  export type ${enumName}Type = {
	[key: string]: string;
};
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

const configs = [
	{
		inputPath: join(__dirname, '../src/tokens/color.json'),
		outputPath: join(__dirname, '../src/Colors/Color.ts'),
		enumName: 'Color',
		isTailwind: false,
	},
	{
		inputPath: join(__dirname, '../src/tokens/color.json'),
		outputPath: join(__dirname, '../src/Colors/ColorTailwind.ts'),
		enumName: 'ColorTailwind',
		isTailwind: true,
	},
	{
		inputPath: join(__dirname, '../src/tokens/spacing.json'),
		outputPath: join(__dirname, '../src/Spacing/Spacing.ts'),
		enumName: 'Spacing',
		isTailwind: false,
	},
	{
		inputPath: join(__dirname, '../src/tokens/typography.json'),
		outputPath: join(__dirname, '../src/Typography/Typography.ts'),
		enumName: 'Typography',
		isTailwind: false,
	},
];

(async () => {
	for (const config of configs) {
		await generateTypeFile(config);
	}
})();
