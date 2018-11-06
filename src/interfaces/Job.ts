import { error } from '../utils/log'
import { getBrowser } from '../utils/browser'

type GetCookieFunction = (user: object) => object[];

export default class Job {
  constructor (user) {
    this.user = user
    this.browser = getBrowser()
  }

  protected readonly user: object
  protected readonly browser: any
  protected name: string
  protected cookies: object[]
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
