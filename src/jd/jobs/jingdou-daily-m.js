const auth = require('../auth/mobile')
const puppeteer = require('puppeteer')
const {success, mute, error} = require('../../utils/log')
const {abortUselessRequests} = require('../../utils/puppeteer')

async function getCurrentBeanCount (browser, cookies) {
  const page = await browser.newPage()
  await abortUselessRequests(page)
  await page.setCookie(...cookies)
  await page.goto('https://bean.m.jd.com/')
  const result = await page.$('span[type="Bold"]')
  const resultText = (await page.evaluate(element => element.textContent, result))
  await page.close()
  return parseInt(resultText)
}

module.exports = async function (user) {
  console.log('开始移动端每日签到任务')
  const browser = await puppeteer.launch()
  try {
    const cookies = auth.getSavedCookies(user)
    const beanBefore = await getCurrentBeanCount(browser, cookies)
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://bean.m.jd.com/bean/signIndex.action')
    const beanAfter = await getCurrentBeanCount(browser, cookies)
    if (beanAfter === beanBefore) {
      console.log(mute('今日已签到'))
    } else {
      console.log(success(`签到成功，获得${beanAfter - beanBefore}个京豆`))
    }
    await page.close()
  } catch (e) {
    console.log(error('任务失败'), error(e.message))
  } finally {
    await browser.close()
  }
}
