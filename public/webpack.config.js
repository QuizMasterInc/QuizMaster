const path = require('path')

module.exports = {
  mode: 'development',
  entry: './js/script.js', // entry file where we want webpack to look for js main source to bundle.
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js' // name of output file
  },
  watch: true
}