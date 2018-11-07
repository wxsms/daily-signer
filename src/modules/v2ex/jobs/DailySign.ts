import { success, mute } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/WebJob'

export default class DailySign extends Job {
  constructor (user) {
    super(user)
    this.name = '每日签到'
  }

  protected _run = async () => {
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
