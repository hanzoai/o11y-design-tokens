import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import postcss from 'postcss';
import fs from 'fs';
import cssnano from 'cssnano';

const processCSSFile = (inputPath: string, outputPath: string) => {
	fs.readFile(inputPath, (err, css) => {
		if (err) throw err;
		postcss([cssnano({ preset: 'default' })])
			.process(css, { from: inputPath, to: outputPath })
			.then((result) => {
				fs.writeFile(outputPath, result.css, () => true);
				if (result.map) {
					fs.writeFile(outputPath + '.map', result.map.toString(), () => true);
				}
			});
	});
};

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'designTokens',
			fileName: 'design-tokens',
		},
		rollupOptions: {
			external: [],
		},
	},
	plugins: [
		dts({
			include: ['src/**/*'],
			outDir: 'dist',
			rollupTypes: true,
		}),
		{
			name: 'copy-css',
			writeBundle() {
				// Process both CSS files
				processCSSFile(
					resolve(__dirname, 'src/style.css'),
					resolve(__dirname, 'dist/style.css'),
				);
				processCSSFile(
					resolve(__dirname, 'src/tailwind-theme.css'),
					resolve(__dirname, 'dist/tailwind-theme.css'),
				);
			},
		},
	],
});
