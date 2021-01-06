import babel from '@rollup/plugin-babel';
// import {uglify} from "rollup-plugin-uglify";

export default {
    input: 'src/index.js',
    plugins: [
        babel({babelHelpers: 'bundled'})
    ],
    output: [
        {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'jtween'
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            name: 'jtween',
            // plugins: [uglify()]
        }
    ]
}
