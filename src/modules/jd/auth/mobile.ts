import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as path from 'path'
import md5 from '../../../utils/md5'
import * as base64 from '../../../utils/base64'
import { getBrowser } from '../../../utils/browser'

function getCookiePathByUser (user) {
  return path.join(__dirname, '../../../../temp/', md5('cookies-jd-m' + user.username))
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
  await page.goto('https://plogin.m.jd.com/user/login.action')
  user.username && await page.type('#username', user.username)
  user.password && await page.type('#password', user.password)
  // 等待用户登录成功，页面将跳转到 jd.com
  await page.waitForFunction('window.location.href.indexOf("https://m.jd.com/") >= 0', {timeout: 0})
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
    // 此处不能忽略资源，否则会无限加载
    // await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://home.m.jd.com/myJd/newhome.action', {waitUntil: 'networkidle0'})
    const valid = await page.$('#userName') !== null
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
