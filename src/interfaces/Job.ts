import { error } from '../utils/log'
import { getBrowser } from '../utils/browser'
import * as puppeteer from 'puppeteer'
import User from './User'

type GetCookieFunction = (user: User) => puppeteer.Cookie[];

export default class Job {
  constructor (user: User) {
    this.user = user
    this.browser = getBrowser()
  }

  protected readonly browser: puppeteer.Browser
  protected readonly user: User
  protected name: string
  protected cookies: puppeteer.Cookie[]
  protected getCookies: GetCookieFunction

  protected async _run () {
    return
  }

  public async run () {
    console.log(`开始【${this.name}】任务`)
    try {
      this.cookies = this.getCookies(this.user)
      await this._run()
    } catch (e) {
      console.log(error('任务失败'), error(e.message))
    }
  }
}
