import * as path from 'path'
import { abortUselessRequests } from '../../../utils/puppeteer'
import md5 from '../../../utils/md5'
import Auth from '../../../interfaces/Auth'

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
    await page.goto('https://www.v2ex.com/settings')
    return await page.$('form[action="/settings"]') !== null
  }
}
