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
    const bodyHTML = await page.evaluate(() => document.body.innerHTML)
    const successMatch = bodyHTML.match(/已连续登录 \d+ 天/)
    if (successMatch) {
      console.log(success(successMatch[0]))
    } else {
      console.log(mute('签到失败'))
    }
    await page.close()
  }
}
