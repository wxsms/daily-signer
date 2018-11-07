import { error } from '../utils/log'
import { getBrowser } from '../utils/browser'
import * as puppeteer from 'puppeteer'
import User from './User'

export default abstract class Job {
  protected constructor (user: User) {
    this.user = user
    this.browser = getBrowser()
  }

  protected readonly browser: puppeteer.Browser
  protected readonly user: User
  protected name: string
  protected cookies: puppeteer.Cookie[]

  protected abstract getCookies (user: User): puppeteer.Cookie[]

  protected abstract async _run (): Promise<void>

  public async run (): Promise<void> {
    const skipJobs = this.user.skipJobs
    if (skipJobs && skipJobs.indexOf(this.name) >= 0) {
      console.log(`跳过【${this.name}】任务`)
      return
    }
    console.log(`开始【${this.name}】任务`)
    try {
      this.cookies = this.getCookies(this.user)
      await this._run()
    } catch (e) {
      console.log(error('任务失败，将重试一次'), error(e.message))
      try {
        await this._run()
      } catch (e) {
        console.log(error('任务失败'), error(e.message))
      }
    }
  }
}
