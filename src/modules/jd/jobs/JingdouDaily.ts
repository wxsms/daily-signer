import { success, mute } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/WebJob'

export default class JingdouDaily extends Job {
  constructor (user) {
    super(user)
    this.name = '网页端每日签到'
  }

  protected async _run () {
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
