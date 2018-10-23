const auth = require('../auth')
const chalk = require('chalk')
const cookies = auth.getSavedCookies()

module.exports = async function (browser) {
  console.log('开始每日签到任务')
  const page = await browser.newPage()
  await page.setCookie(...cookies)
  await page.goto('https://vip.jd.com/sign/index')
  const result = await page.$('.active-info > .title')
  const successText = await page.evaluate(element => element.textContent, result)
  if (successText.indexOf('获得') >= 0) {
    console.log(chalk.green(successText))
  } else {
    console.log(chalk.gray(successText))
  }
}
