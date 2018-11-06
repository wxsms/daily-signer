import * as fs from 'fs'
import * as path from 'path'
import jd from './modules/jd/index'
import v2ex from './modules/v2ex/index'
import { initBrowser } from './utils/browser'

async function main () {
  // make sure temp dir exist
  const tempDir = (path.join(process.cwd(), 'temp'))
  !fs.existsSync(tempDir) && fs.mkdirSync(tempDir)
  await initBrowser()
  // start jobs
  await jd()
  await v2ex()
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
