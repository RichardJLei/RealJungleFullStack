export default {
  presets: [
    '@babel/preset-env',
    ['@babel/preset-react', {runtime: 'automatic'}]
  ],
  env: {
    test: {
      plugins: ['@babel/plugin-transform-modules-commonjs']
    }
  }
}; 