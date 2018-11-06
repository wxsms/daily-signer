import * as auth from '../auth/web'
import { success, mute, warning } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../../../interfaces/Job'

export default class JingDouDaily extends Job {
  constructor (user) {
    super(user)
    this.name = '网页端京东金融每日签到'
    this.getCookies = auth.getSavedCookies
  }

  _run = async () => {
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

  async run () {
    await super.run()
  }
}
