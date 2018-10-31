const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const {createCanvas, Image} = require('canvas')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const md5 = require('../../../utils/md5')
const base64 = require('../../../utils/base64')
const {getBrowser} = require('../../../utils/browser')

function getCookiePathByUser (user) {
  return path.join(__dirname, '../../../../temp/', md5('cookies-jd' + user.username))
}

function getVerifyPosition (base64, actualWidth) {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(1000, 1000)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const width = img.naturalWidth
      const height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      let cloestX = 0
      let minSum = 255 * 3
      for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
          const data = ctx.getImageData(i, j, 1, 1).data
          const rgbSum = data[0] + data[1] + data[2]
          if (rgbSum < minSum) {
            cloestX = i
            minSum = rgbSum
          }
        }
      }
      resolve(cloestX * actualWidth / width)
    }
    img.onerror = reject
    img.src = base64
  })
}

async function login (user) {
  const browser = await puppeteer.launch({
    headless: true,
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
  await page.click('#loginsubmit')
  await page.waitFor(1000)
  // 需要验证码
  let tryTimes = 0
  while (await page.$('.JDJRV-bigimg')) {
    console.log(`正在尝试破解验证码（第${++tryTimes}次）`)
    const img = await page.$('.JDJRV-bigimg > img')
    const distance = await getVerifyPosition(
      await page.evaluate(element => element.getAttribute('src'), img),
      await page.evaluate(element => parseInt(window.getComputedStyle(element).width), img)
    )
    const smallImg = await page.$('.JDJRV-smallimg')
    const smallImgWidth = await page.evaluate(element => element.getBoundingClientRect().width, smallImg)
    const dragBtn = await page.$('.JDJRV-slide-btn')
    const dragBtnPosition = await page.evaluate(element => {
      const {x, y, width, height} = element.getBoundingClientRect()
      return {x, y, width, height}
    }, dragBtn)
    const x = dragBtnPosition.x + dragBtnPosition.width / 2
    const y = dragBtnPosition.y + dragBtnPosition.height / 2
    const distance1 = distance - 10 - smallImgWidth / 2
    const distance2 = 10
    await page.mouse.move(x, y)
    await page.mouse.down()
    await page.mouse.move(x + distance1, y, {steps: 30})
    await page.waitFor(500)
    await page.mouse.move(x + distance1 + distance2, y, {steps: 20})
    await page.waitFor(500)
    await page.mouse.up()
    await page.waitFor(2000)
  }

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
