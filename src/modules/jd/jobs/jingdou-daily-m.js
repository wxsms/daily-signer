const auth = require('../auth/mobile')
const {success, mute} = require('../../../utils/log')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const Job = require('../../../interfaces/Job')

module.exports = class JongdouDailyMobile extends Job {
  constructor (...args) {
    super(...args)
    this.name = '移动端每日签到'
    this.getCookies = auth.getSavedCookies
  }

  async getCurrentBeanCount () {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://bean.m.jd.com/')
    const result = await page.$('span[type="Bold"]')
    const resultText = await page.evaluate(element => element.textContent, result)
    await page.close()
    return parseInt(resultText)
  }

  async run () {
    const beanBefore = await this.getCurrentBeanCount()
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://bean.m.jd.com/bean/signIndex.action')
    const beanAfter = await this.getCurrentBeanCount()
    if (beanAfter === beanBefore) {
      console.log(mute('今日已签到'))
    } else {
      console.log(success(`签到成功，获得${beanAfter - beanBefore}个京豆`))
    }
    await page.close()
  }
}
