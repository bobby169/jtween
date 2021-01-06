import babel from '@rollup/plugin-babel';
import {uglify} from "rollup-plugin-uglify";

export default {
    input: 'src/index.js',
    plugins: [
        babel({babelHelpers: 'bundled'})
    ],
    output: [
        {
            file: 'dist/index.min.js',
            format: 'umd',
            name: 'jtween',
            plugins: [uglify()]
        },
        {
            file: 'dist/index.js',
            format: 'esm',
            name: 'jtween',
        }
    ]
}
