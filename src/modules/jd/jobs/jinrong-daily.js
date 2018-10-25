const auth = require('../auth/web')
const {success, mute, warning} = require('../../../utils/log')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const Job = require('../../../interfaces/Job')

module.exports = class JingDouDaily extends Job {
  constructor (...args) {
    super(...args)
    this.name = '网页端京东金融每日签到'
    this.getCookies = auth.getSavedCookies
  }

  async run () {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://vip.jr.jd.com/')
    const statusEle = await page.$('.m-qian')
    const statusText = await page.evaluate(element => element.textContent, statusEle)
    if (statusText.indexOf('已签到') >= 0) {
      console.log(mute('已签到'))
    } else {
      await page.click('.m-qian')
      await page.waitFor(1000)
      await page.waitFor('#getRewardText')
      const successText = await page.evaluate(element => element.textContent, await page.$('#getRewardText'))
      console.log(successText ? success(successText) : warning('未知签到状态'))
    }
    await page.close()
  }
}
