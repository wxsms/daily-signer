const auth = require('../auth/web')
const puppeteer = require('puppeteer')
const {success, mute, error} = require('../../utils/log')
const {abortUselessRequests} = require('../../utils/puppeteer')

module.exports = async function (user) {
  console.log('开始每日签到任务')
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...auth.getSavedCookies(user))
    await page.goto('https://vip.jd.com/sign/index')
    const result = await page.$('.day-info.active > .active-info > .title')
    const successText = await page.evaluate(element => element.textContent, result)
    if (successText.indexOf('获得') >= 0) {
      console.log(success(successText))
    } else {
      console.log(mute(successText))
    }
    await page.close()
  } catch (e) {
    console.log(error('任务失败'), error(e.message))
  } finally {
    await browser.close()
  }
}
