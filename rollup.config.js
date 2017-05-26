import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import string from 'rollup-plugin-string';

export default {
  format: 'iife',
  plugins: [
    string({
      include: 'src/**/*.css'
    }),
    babel({
      exclude: process.env.BABEL_ENV === 'production' ? '' : 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true,
      main: true
    })
  ]
};
