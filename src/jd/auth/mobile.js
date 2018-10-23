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
  await page.goto('https://plogin.m.jd.com/user/login.action')
  const savedUser = require('../../../config/user.json')
  if (savedUser) {
    await page.type('#username', savedUser.jd.username)
    await page.type('#password', savedUser.jd.password)
  }
  // 等待用户登录成功，页面将跳转到 jd.com
  await page.waitForFunction('window.location.href.indexOf("https://m.jd.com/") >= 0', {timeout: 0})
  const cookies = await page.cookies()
  fs.writeFileSync(path.join(__dirname, '../../../temp/cookies-jd-m'), JSON.stringify(cookies))
  await browser.close()
  console.log('登录成功！')
}

function getSavedCookies () {
  const cookieStr = fs.readFileSync(path.join(__dirname, '../../../temp/cookies-jd-m')).toString()
  return JSON.parse(cookieStr)
}

async function checkCookieStillValid (cookies) {
  console.log('检查 Cookies 是否有效...')
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  //await abortUselessRequests(page)
  await page.setCookie(...cookies)
  await page.goto('https://home.m.jd.com/myJd/newhome.action', {waitUntil: 'networkidle0'})
  const valid = await page.$('#userName') !== null
  if (valid) {
    console.log('Cookies 有效，直接登录')
  } else {
    console.log('Cookies 已失效')
  }
  return valid
}

module.exports = {login, getSavedCookies, checkCookieStillValid}
