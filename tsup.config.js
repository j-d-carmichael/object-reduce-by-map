export default {
  entry: ['src/reducer.js'],
  format: ['cjs', 'esm'],
  outDir: 'dist',
  external: ['typescript'],
  splitting: false,
  sourcemap: false,
  clean: true,
};
