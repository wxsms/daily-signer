import { success, mute } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/MobileJob'

export default class JinrongZhuanqianMobile extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端金融赚钱签到'
  }

  protected _run = async () => {
    const page = await this.browser.newPage()
    //await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://m.jr.jd.com/spe/qyy/hzq/index.html?usertype=1176&from=daka#/', {waitUntil: 'networkidle0'})
    await page.waitForSelector('.gangbeng .btn', {visible: true})
    const btn = await page.$('.gangbeng .btn')
    await btn.click()
    await page.waitForSelector('.am-modal-body .title', {visible: true})
    const text = await page.evaluate(el => el.textContent, await page.$('.am-modal-body .title'))
    if (text.indexOf('明天再来') >= 0) {
      console.log(mute(text))
    } else {
      console.log(success(text))
    }
    await page.close()
  }
}
