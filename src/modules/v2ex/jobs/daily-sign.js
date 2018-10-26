const auth = require('../auth/web')
const {success, mute} = require('../../../utils/log')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const Job = require('../../../interfaces/Job')

module.exports = class DailySign extends Job {
  constructor (...args) {
    super(...args)
    this.name = '每日签到'
  }

  getCookies () {
    return auth.getSavedCookies(this.user)
  }

  async run () {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://www.v2ex.com/mission/daily')
    const btn = await page.$('input[type="button"].super.normal.button')
    const btnText = await page.evaluate(element => element.getAttribute('value'), btn)
    // console.log(btnText)
    if (btn && btnText.indexOf('领取') >= 0) {
      await Promise.all([
        page.waitForNavigation(),
        btn.click()
      ])
      const bodyHTML = await page.evaluate(() => document.body.innerHTML)
      const successMatch = bodyHTML.match(/已连续登录 \d+ 天/)
      console.log(success(successMatch[0]))
    } else {
      const bodyHTML = await page.evaluate(() => document.body.innerHTML)
      const successMatch = bodyHTML.match(/已连续登录 \d+ 天/)
      console.log(mute(successMatch[0]))
    }
    await page.close()
  }
}
