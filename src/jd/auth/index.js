const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {abortUselessRequests} = require('../../utils/puppeteer')

async function login () {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1024,
      height: 768
    }
  })
  const page = await browser.newPage()
  await page.goto('https://passport.jd.com/new/login.aspx')
  page.click('.login-tab.login-tab-r > a')
  const savedUser = require('../../../config/user.json')
  if (savedUser) {
    await page.$eval('#loginname', (el, value) => el.value = value, savedUser.jd.username)
    await page.$eval('#nloginpwd', (el, value) => el.value = value, savedUser.jd.password)
  }
  // 等待用户登录成功，页面将跳转到 jd.com
  await page.waitForFunction('window.location.href.indexOf("https://www.jd.com") >= 0', {timeout: 0})
  const cookies = await page.cookies()
  fs.writeFileSync(path.join(__dirname, '../../../temp/cookies-jd'), JSON.stringify(cookies))
  await browser.close()
  console.log('登录成功！')
}

function getSavedCookies () {
  const cookieStr = fs.readFileSync(path.join(__dirname, '../../../temp/cookies-jd')).toString()
  return JSON.parse(cookieStr)
}

async function checkCookieStillValid (cookies) {
  console.log('检查 Cookies 是否有效...')
  const browser = await puppeteer.launch({
    headless: true
  })
  const page = await browser.newPage()
  await abortUselessRequests(page)
  await page.setCookie(...cookies)
  await page.goto('https://order.jd.com/center/list.action')
  const valid = await page.$('body[myjd="_MYJD_ordercenter"]') !== null
  if (valid) {
    console.log('Cookies 有效，直接登录')
  } else {
    console.log('Cookies 已失效')
  }
  return valid
}

module.exports = {login, getSavedCookies, checkCookieStillValid}
