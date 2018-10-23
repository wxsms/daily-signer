const jd = require('./src/jd')
const fs = require('fs')
const path = require('path')

async function main () {
  // make sure temp dir exist
  const tempDir = (path.join(__dirname, 'temp'))
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir)
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
