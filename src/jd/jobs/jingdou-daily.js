const auth = require('../auth')

module.exports = async function (browser) {
  console.log('开始每日签到任务')
  const page = await browser.newPage()
  await page.setCookie(...auth.getSavedCookies())
  await page.goto('https://vip.jd.com/sign/index')
  const result = await page.$('.active-info > .title')
  const successText = await page.evaluate(element => element.textContent, result)
  console.log(successText)
}
