import { success, mute, error } from '../../../utils/log'
import Job from '../interfaces/MobileJob'

export default class DoubleSign extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端双签'
  }

  protected _run = async () => {
    const beanBefore = await this.getCurrentBeanCount()
    const page = await this.browser.newPage()
    await page.setCookie(...this.cookies)
    await page.goto('https://ljd.m.jd.com/countersign/receiveAward.json')
    const res = JSON.parse(await page.evaluate(element => element.textContent, await page.$('pre')))
    const code = res.res.code
    const awardData = res.res.data && res.res.data[0]
    if (code === '0') {
      if (awardData) {
        const beanAfter = await this.getCurrentBeanCount()
        if (beanAfter === beanBefore) {
          console.log(mute('今日已签到'))
        } else {
          console.log(success(`签到成功，获得${beanAfter - beanBefore}个京豆`))
        }
      } else {
        console.log(mute('颗粒无收'))
      }
    } else if (code === 'DS102') {
      console.log(mute('活动未开始'))
    } else if (code === 'DS103') {
      console.log(mute('活动已结束'))
    } else if (code === 'DS104') {
      console.log(mute('颗粒无收'))
    } else if (code === 'DS106') {
      console.log(mute('未完成双签'))
    } else {
      console.log(error('未知状态'), error(code))
    }
  }
}
