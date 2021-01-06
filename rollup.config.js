import babel from '@rollup/plugin-babel';
import {uglify} from "rollup-plugin-uglify";

export default {
    input: 'src/index.js',
    plugins: [
        babel({babelHelpers: 'bundled'})
    ],
    output: [
        {
            file: 'dist/jtween.min.js',
            format: 'umd',
            name: 'jtween',
            plugins: [uglify()]
        },
        {
            file: 'dist/jtween.js',
            format: 'esm',
            name: 'jtween',
        }
    ]
}
