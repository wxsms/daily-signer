const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const md5 = require('../../../utils/md5')
const base64 = require('../../../utils/base64')
const {getBrowser} = require('../../../utils/browser')

function getCookiePathByUser (user) {
  return path.join(__dirname, '../../../../temp/', md5('cookies-jd' + user.username))
}

async function login (user) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 768
    }
  })
  const page = await browser.newPage()
  await page.goto('https://passport.jd.com/new/login.aspx')
  await page.click('.login-tab.login-tab-r > a')
  user.username && await page.$eval('#loginname', (el, value) => el.value = value, user.username)
  user.password && await page.$eval('#nloginpwd', (el, value) => el.value = value, user.password)
  // 等待用户登录成功，页面将跳转到 jd.com
  await page.waitForFunction('window.location.href.indexOf("https://www.jd.com") >= 0', {timeout: 0})
  const cookies = await page.cookies()
  fs.writeFileSync(getCookiePathByUser(user), base64.encode(JSON.stringify(cookies)))
  await browser.close()
  console.log('登录成功！')
}

function getSavedCookies (user) {
  const cookieStr = fs.readFileSync(getCookiePathByUser(user)).toString()
  return JSON.parse(base64.decode(cookieStr))
}

async function checkCookieStillValid (user) {
  try {
    console.log('检查 Cookies 是否有效...')
    const cookies = getSavedCookies(user)
    const browser = getBrowser()
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://order.jd.com/center/list.action')
    const valid = await page.$('body[myjd="_MYJD_ordercenter"]') !== null
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

module.exports = {login, getSavedCookies, checkCookieStillValid}
