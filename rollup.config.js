import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default [
  // UMD build (for browsers via script tag)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/fingerprint.umd.js',
      format: 'umd',
      name: 'Fingerprint',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // UMD minified build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/fingerprint.umd.min.js',
      format: 'umd',
      name: 'Fingerprint',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
      terser(),
    ],
  },
  // ESM build (for modern bundlers)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/fingerprint.esm.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
  // CommonJS build (for Node.js)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/fingerprint.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
];
