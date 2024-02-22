import { resolve } from 'node:path';

import stylelint from 'stylelint';

async function checkCssCompact() {
    const result = await stylelint.lint({
        cwd: resolve(import.meta.dirname, '../'),
        files: 'dist/**/*.css',
        formatter: 'string',
        config: {
            plugins: ['stylelint-no-unsupported-browser-features'],
            rules: {
                'plugin/no-unsupported-browser-features': [
                    true,
                    {
                        ignore: ['css-overflow', 'viewport-unit-variants'],
                    },
                ],
            },
        },
    });

    if (result.errored) {
        console.log(result.report);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
    }
}

checkCssCompact();
