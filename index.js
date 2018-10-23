const jd = require('./src/jd')

async function main () {
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
