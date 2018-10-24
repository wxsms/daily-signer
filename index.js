const jd = require('./src/modules/jd')
const fs = require('fs')
const path = require('path')
const {initBrowser} = require('./src/utils/browser')

async function main () {
  // make sure temp dir exist
  const tempDir = (path.join(__dirname, 'temp'))
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir)
  await initBrowser()
  // start jobs
  await jd()
}

main()
  .then(() => {
    console.log('done.')
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
