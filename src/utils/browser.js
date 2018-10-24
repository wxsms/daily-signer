const puppeteer = require('puppeteer')

let browser = null

async function initBrowser () {
  browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 768
    }
  })
}

function getBrowser () {
  return browser
}

module.exports = {initBrowser, getBrowser}
