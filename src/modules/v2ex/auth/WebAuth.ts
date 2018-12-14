import * as path from 'path'
import { abortUselessRequests } from '../../../utils/puppeteer'
import md5 from '../../../utils/md5'
import Auth from '../../../interfaces/Auth'
import { success } from '../../../utils/log'

export default class WebAuth extends Auth {
  constructor (user) {
    super(user)
  }

  protected getCookiePath () {
    return path.join(process.cwd(), 'temp', md5('cookies-v2ex' + this.user.username))
  }

  protected async _login (page) {
    await page.goto('https://www.v2ex.com/signin')
    this.user.username && await page.type('.sl', this.user.username)
    this.user.password && await page.type('.sl[type="password"]', this.user.password)
    // 等待用户登录成功
    await page.waitForFunction('window.location.href === "https://www.v2ex.com/"', {timeout: 0})
  }

  protected async _check (page) {
    await abortUselessRequests(page)
    // V站由于某种特殊的原因，登录检测也需要用签到方式。因此当登录检测通过后，签到就已经成功了
    await page.goto('https://www.v2ex.com/mission/daily')
    const btn = await page.$('input[type="button"].super.normal.button')
    const btnText = await page.evaluate(element => element.getAttribute('value'), btn)
    // console.log(btnText)
    if (btn && btnText.indexOf('领取') >= 0) {
      const bodyHTMLBefore = await page.evaluate(() => document.body.innerHTML)
      const beforeMatch = bodyHTMLBefore.match(/已连续登录 \d+ 天/)
      await Promise.all([
        page.waitForNavigation(),
        btn.click()
      ])
      const bodyHTML = await page.evaluate(() => document.body.innerHTML)
      const successMatch = bodyHTML.match(/已连续登录 \d+ 天/)
      const isSuccess = successMatch[0] !== beforeMatch[0]
      if (isSuccess) {
        console.log(success('签到成功'))
      }
      return isSuccess
    } else {
      return true
    }
  }
}
