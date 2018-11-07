import { success, mute } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/MobileJob'

export default class JingdouDailyMobile extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端每日签到'
  }

  protected _run = async () => {
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
