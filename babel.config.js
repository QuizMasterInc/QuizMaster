module.exports = {
  presets: [
    ['@babel/preset-env', { modules: "commonjs", targets: { node: 'current' } }],
    '@babel/preset-react',
    '@babel/preset-flow',
  ],
  plugins: [
    'babel-plugin-styled-components',
    '@babel/plugin-proposal-class-properties',
  ]
}