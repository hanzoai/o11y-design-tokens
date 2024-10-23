import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import postcss from 'postcss';
import fs from 'fs';
import cssnano from 'cssnano';

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
				// Process the CSS file with PostCSS before copying

				const cssFilePath = resolve(__dirname, 'src/style.css');
				const outputFilePath = resolve(__dirname, 'dist/style.css');

				// Read the CSS file
				fs.readFile(cssFilePath, (err, css) => {
					if (err) throw err;

					// Process the CSS with PostCSS
					postcss([cssnano({ preset: 'default' })])
						.process(css, { from: cssFilePath, to: outputFilePath })
						.then((result) => {
							// Write the minified CSS to the dist folder
							fs.writeFile(outputFilePath, result.css, () => true);
							if (result.map) {
								fs.writeFile(
									outputFilePath + '.map',
									result.map.toString(),
									() => true,
								);
							}
						});
				});
			},
		},
	],
});
