import { defineConfig } from '@rspack/cli';
import rspack from '@rspack/core';
import browserslist from 'browserslist';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import * as lightningcss from 'lightningcss';
import { merge } from 'webpack-merge';

import commonConfig from './common.js';

const prodConfig = defineConfig({
    mode: 'production',
    devtool: false,
    // rspack seems still not support
    // performance: {
    //     // 2MiB
    //     maxEntrypointSize: 1024 * 1024 * 2,
    // },
    experiments: {
        rspackFuture: {
            newTreeshaking: true,
        },
    },
    optimization: {
        runtimeChunk: {
            name: 'runtime',
        },
        splitChunks: {
            cacheGroups: {
                lib: {
                    test: /[/\\]node_modules[/\\](react|react-dom|antd)[/\\]/,
                    name: 'lib',
                    chunks: 'all',
                    priority: 100,
                },
                vendor: {
                    test: /[/\\]node_modules[/\\]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 1,
                },
            },
        },
        minimize: true,
        minimizer: [
            new rspack.SwcJsMinimizerRspackPlugin(),
            // @ts-expect-error wait to be fixed
            new CssMinimizerPlugin({
                minify: CssMinimizerPlugin.lightningCssMinify,
                minimizerOptions: {
                    // @ts-expect-error wait to be fixed
                    targets: lightningcss.browserslistToTargets(browserslist()),
                },
            }),
        ],
    },
});

export default merge(commonConfig, prodConfig);
