const auth = require('../auth/mobile')
const cookies = auth.getSavedCookies()
const {success, mute, error} = require('../../utils/log')
const {abortUselessRequests} = require('../../utils/puppeteer')

module.exports = async function (browser) {
  console.log('开始移动端每日签到任务')
  try {
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://bean.m.jd.com/bean/signIndex.action')
    const result = await page.$('.gradBackground')
    const successText = (await page.evaluate(element => element.textContent, result)).replace('查看更多活动', '')
    if (successText.indexOf('今天已签到') >= 0) {
      console.log('  -', mute(successText))
    } else {
      console.log('  -', success(successText))
    }
  } catch (e) {
    console.log(error('任务失败'), error(e.message))
  }
}
