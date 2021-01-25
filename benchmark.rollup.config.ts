import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import json from 'rollup-plugin-json'
import { base64 } from 'rollup-plugin-base64'

export default {
  input: `benchmark/suite.js`,
  output: [
    {
      file: 'dist/benchmark.js',
      format: 'iife',
      name: 'gocsvBenchmark',
      // <<<<<< adds this line into the bundle.js >>>>>>>  const global = window;
      intro: 'const global = window;',
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    base64({ include: '**/*.csv' }),
  ],
}
