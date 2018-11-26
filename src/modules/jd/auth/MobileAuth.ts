import * as path from 'path'
import md5 from '../../../utils/md5'
import Auth from '../../../interfaces/Auth'

export default class MobileAuth extends Auth {
  constructor (user) {
    super(user)
  }

  protected getCookiePath () {
    return path.join(process.cwd(), 'temp', md5('cookies-jd-m' + this.user.username))
  }

  protected async _login (page) {
    await page.goto('https://plogin.m.jd.com/user/login.action')
    this.user.username && await page.type('#username', this.user.username)
    this.user.password && await page.type('#password', this.user.password)
    // 等待用户登录成功，页面将跳转到 jd.com
    await page.waitForFunction('window.location.href.indexOf("https://m.jd.com/") >= 0', {timeout: 0})
  }

  protected async _check (page) {
    await page.goto('https://home.m.jd.com/myJd/newhome.action', {waitUntil: 'networkidle0'})
    return await page.$('.user_info') !== null
  }
}
