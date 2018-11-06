const typescript = require('rollup-plugin-typescript')
const uglify = require('rollup-plugin-uglify').uglify
const fs = require('fs')
const path = require('path')
const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8'))
const external = ['fs', 'path', 'crypto', ...Object.keys(pkg.dependencies || {})]

module.exports = {
  input: './src/index.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'cjs'
  },
  external,
  plugins: [
    typescript(),
    uglify()
  ]
}
