import * as auth from '../auth/mobile'
import { success, mute, error } from '../../../utils/log'
import Job from '../../../interfaces/Job'

export default class JingDouDaily extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端双签'
    this.getCookies = auth.getSavedCookies
  }

  _run = async () => {
    const page = await this.browser.newPage()
    await page.setCookie(...this.cookies)
    await page.goto('https://ljd.m.jd.com/countersign/receiveAward.json')
    const res = JSON.parse(await page.evaluate(element => element.textContent, await page.$('pre')))
    const code = res.res.code
    const awardData = res.res.data && res.res.data[0]
    if (code === '0') {
      if (awardData) {
        console.log(success(`领到${awardData.awardName}${awardData.awardCount}个`))
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

  async run () {
    await super.run()
  }
}
