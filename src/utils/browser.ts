import * as puppeteer from 'puppeteer'

let browser = null

export async function initBrowser () {
  browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
      width: 1280,
      height: 768
    }
  })
}

export function getBrowser () {
  return browser
}
