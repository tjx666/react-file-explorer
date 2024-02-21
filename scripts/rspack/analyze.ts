import { RsdoctorRspackPlugin } from '@rsdoctor/rspack-plugin';
import { defineConfig } from '@rspack/cli';
import { merge } from 'webpack-merge';

import prodConfig from './prod.js';

const analyzeConfig = defineConfig({
    plugins: [new RsdoctorRspackPlugin({})],
});

console.log('analyze mode!');

export default merge(prodConfig, analyzeConfig);
