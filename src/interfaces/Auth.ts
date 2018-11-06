import * as puppeteer from 'puppeteer'
import * as fs from 'fs'
import * as base64 from '../utils/base64'
import { getBrowser } from '../utils/browser'
import User from './User'

export default abstract class Auth {
  protected constructor (user: User) {
    this.user = user
    this.canAutoLogin = false
  }

  protected canAutoLogin: boolean

  protected readonly user: User

  protected abstract async _login (page: puppeteer.Page): Promise<void>

  protected abstract async _check (page: puppeteer.Page): Promise<boolean>

  protected abstract getCookiePath (): string

  public getSavedCookies (): puppeteer.Cookie[] {
    const cookieStr = fs.readFileSync(this.getCookiePath()).toString()
    return <puppeteer.Cookie[]>JSON.parse(base64.decode(cookieStr))
  }

  public async login (): Promise<void> {
    const browser: puppeteer.Browser = await puppeteer.launch({
      headless: this.canAutoLogin,
      defaultViewport: {
        width: 1024,
        height: 768
      }
    })
    const page: puppeteer.Page = await browser.newPage()
    await this._login(page)
    const cookies: puppeteer.Cookie[] = await page.cookies()
    fs.writeFileSync(this.getCookiePath(), base64.encode(JSON.stringify(cookies)))
    await browser.close()
    console.log('登录成功！')
  }

  public async check (): Promise<boolean> {
    try {
      console.log('检查 Cookies 是否有效...')
      const cookies: puppeteer.Cookie[] = this.getSavedCookies()
      const browser: puppeteer.Browser = getBrowser()
      const page: puppeteer.Page = await browser.newPage()
      await page.setCookie(...cookies)
      const valid: boolean = await this._check(page)
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
