const ejs    = require('ejs')
const fs     = require('fs-extra')
const minify = require('html-minifier').minify
const sass   = require('node-sass')

prepareDist().then(() => {
  Promise.all([copyAssets(), buildCSS(), buildJS()])
    .then(([assets, css, js]) => {
      buildHTML(css, js).then(() => console.log('Built.'))
    })
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
})

function copyAssets() {
  return new Promise((resolve, reject) => {
    fs.copySync('assets/images', 'dist/images')
    fs.copySync('assets/video', 'dist/video')
    resolve()
  })
}

function buildCSS() {
  console.log('Building CSS')
  return new Promise((resolve, reject) => {
    const css = sass.render({
      file: 'assets/sass/main.scss',
      outputStyle: 'compressed',
    }, (error, result) => {
      error ? reject(error) : resolve(result.css.toString())
    })
  })
}

function buildJS() {
  console.log('Building JS')
  return new Promise((resolve, reject) => {
    fs.readFile('assets/js/main.js', (error, result) => {
      error ? reject(error) : resolve(result)
    })
  })
}

function buildHTML(css, js) {
  console.log('Building HTML')
  return new Promise((resolve, reject) => {
    const indexTemplate = fs.readFileSync('index.ejs', 'utf8')
    const html = ejs.render(indexTemplate, {
      css : css,
      js  : js,
    })
    const minifiedHTML = minify(html, {
      caseSensitive              : true,
      collapseWhitespace         : true,
      conservativeCollapse       : true,
      html5                      : true,
      minifyCSS                  : true,
      minifyJS                   : true,
      removeAttributeQuotes      : false,
      removeComments             : true,
      removeEmptyAttributes      : true,
      removeScriptTypeAttributes : true,
      useShortDoctype            : true,
    })
    fs.writeFile('dist/index.html', minifiedHTML, (error) => {
      error ? reject(error) : resolve(html)
    })
  })
}

function prepareDist() {
  console.log('Cleaning dist')
  return new Promise((resolve, reject) => {
    fs.emptyDir('dist', (error) => {
      error ? reject(error) : resolve()
    })
  })
}
