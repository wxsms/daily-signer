const auth = require('../auth')
const cookies = auth.getSavedCookies()
const {success, mute} = require('../../utils/log')

module.exports = async function (browser) {
  console.log('开始每日签到任务')
  const page = await browser.newPage()
  await page.setCookie(...cookies)
  await page.goto('https://vip.jd.com/sign/index')
  const result = await page.$('.day-info.active > .active-info > .title')
  const successText = await page.evaluate(element => element.textContent, result)
  if (successText.indexOf('获得') >= 0) {
    console.log('  -', success(successText))
  } else {
    console.log('  -', mute(successText))
  }
}
