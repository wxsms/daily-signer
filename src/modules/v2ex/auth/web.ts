import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'
import { abortUselessRequests } from '../../../utils/puppeteer'
import md5 from '../../../utils/md5'
import * as base64 from '../../../utils/base64'
import { getBrowser } from '../../../utils/browser'

function getCookiePathByUser (user) {
  return path.join(__dirname, '../../../../temp/', md5('cookies-v2ex' + user.username))
}

export async function login (user) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 768
    }
  })
  const page = await browser.newPage()
  await page.goto('https://www.v2ex.com/signin')
  user.username && await page.type('.sl', user.username)
  user.password && await page.type('.sl[type="password"]', user.password)
  // 等待用户登录成功
  await page.waitForFunction('window.location.href === "https://www.v2ex.com/"', {timeout: 0})
  const cookies = await page.cookies()
  fs.writeFileSync(getCookiePathByUser(user), base64.encode(JSON.stringify(cookies)))
  await browser.close()
  console.log('登录成功！')
}

export function getSavedCookies (user) {
  const cookieStr = fs.readFileSync(getCookiePathByUser(user)).toString()
  return JSON.parse(base64.decode(cookieStr))
}

export async function checkCookieStillValid (user) {
  try {
    console.log('检查 Cookies 是否有效...')
    const cookies = getSavedCookies(user)
    const browser = getBrowser()
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://www.v2ex.com/settings')
    const valid = await page.$('form[action="/settings"]') !== null
    if (valid) {
      console.log('Cookies 有效，直接登录')
    } else {
      console.log('Cookies 已失效，请重新登录')
    }
    await page.close()
    return valid
  } catch (e) {
    console.log('Cookies 未找到，请重新登录')
    return false
  }
}
