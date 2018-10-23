const puppeteer = require('puppeteer')
const webAuth = require('./auth/web')
const mobileAuth = require('./auth/mobile')

module.exports = async function () {
  const browser = await puppeteer.launch()
  console.log('任务开始：京东商城（移动端）')
  try {
    await mobileAuth.checkCookieStillValid(mobileAuth.getSavedCookies())
  } catch (e) {
    console.log('Cookies 未找到或已过期，尝试重新登录...')
    await mobileAuth.login()
  }
  await require('./jobs/jingdou-daily-m')(browser)
  console.log('任务开始：京东商城')
  try {
    await webAuth.checkCookieStillValid(webAuth.getSavedCookies())
  } catch (e) {
    console.log('Cookies 未找到或已过期，尝试重新登录...')
    await webAuth.login()
  }
  await require('./jobs/jingdou-daily')(browser)
  await require('./jobs/jingdou-shops')(browser)
  console.log('任务已全部完成')
  console.log('-----------------')
}
