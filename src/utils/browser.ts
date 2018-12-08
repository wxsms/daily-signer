import * as puppeteer from 'puppeteer'

let browser = null

export async function initBrowser () {
  browser = await puppeteer.launch({
    headless: process.env.DEBUG !== '1',
    defaultViewport: {
      width: 1280,
      height: 768
    }
  })
}

export function getBrowser (): puppeteer.Browser {
  return browser
}
