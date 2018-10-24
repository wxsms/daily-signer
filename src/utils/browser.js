const puppeteer = require('puppeteer')

let browser = null

async function initBrowser () {
  browser = await puppeteer.launch({
    headless: true
  })
}

function getBrowser () {
  return browser
}

module.exports = {initBrowser, getBrowser}
