import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as base64 from '../utils/base64'
import { getBrowser } from '../utils/browser'
import User from './User'

export default abstract class Auth {
  protected constructor (user) {
    this.user = user
    this.canAutoLogin = false
  }

  protected canAutoLogin: boolean

  protected readonly user: User

  protected abstract async _login (page: puppeteer.Page)

  protected abstract async _check (page: puppeteer.Page)

  protected abstract getCookiePath (): string

  public getSavedCookies (): puppeteer.Cookie[] {
    const cookieStr = fs.readFileSync(this.getCookiePath()).toString()
    return <puppeteer.Cookie[]>JSON.parse(base64.decode(cookieStr))
  }

  public async login () {
    const browser = await puppeteer.launch({
      headless: this.canAutoLogin,
      defaultViewport: {
        width: 1024,
        height: 768
      }
    })
    const page = await browser.newPage()
    await this._login(page)
    const cookies = await page.cookies()
    fs.writeFileSync(this.getCookiePath(), base64.encode(JSON.stringify(cookies)))
    await browser.close()
    console.log('登录成功！')
  }

  public async check () {
    try {
      console.log('检查 Cookies 是否有效...')
      const cookies = this.getSavedCookies()
      const browser = getBrowser()
      const page = await browser.newPage()
      await page.setCookie(...cookies)
      const valid = await this._check(page)
      if (valid) {
        console.log('Cookies 有效，直接登录')
      } else {
        console.log('Cookies 已失效，请重新登录')
      }
      await page.close()
      return valid
    } catch (e) {
      console.log('Cookies 未找到，请重新登录')
      return false
    }
  }
}
