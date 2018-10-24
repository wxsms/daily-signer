const auth = require('../auth/web')
const {success, mute} = require('../../../utils/log')
const {abortUselessRequests} = require('../../../utils/puppeteer')
const Job = require('../../../interfaces/Job')

module.exports = class JingDouDaily extends Job {
  constructor (props) {
    super(props)
    this.name = '网页端每日签到'
  }

  getCookies () {
    return auth.getSavedCookies(this.user)
  }

  async run () {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://vip.jd.com/sign/index')
    const result = await page.$('.day-info.active > .active-info > .title')
    const successText = await page.evaluate(element => element.textContent, result)
    if (successText.indexOf('获得') >= 0) {
      console.log(success(successText))
    } else {
      console.log(mute(successText))
    }
    await page.close()
  }
}
