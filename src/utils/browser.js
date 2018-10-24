const puppeteer = require('puppeteer')

let browser = null

async function getBrowser () {
  if (browser) {
    return browser
  } else {
    const _browser = await puppeteer.launch({
      headless: true
    })
    if (browser) {
      _browser.close()
      return browser
    } else {
      browser = _browser
      return browser
    }
  }
}

module.exports = {getBrowser}
