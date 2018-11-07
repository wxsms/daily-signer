import * as puppeteer from 'puppeteer'
import Job from '../../../interfaces/Job'
import Auth from '../auth/MobileAuth'
import { abortUselessRequests } from '../../../utils/puppeteer'

const devices = require('puppeteer/DeviceDescriptors')

export default abstract class MobileJob extends Job {
  protected constructor (user) {
    super(user)
    this.auth = new Auth(user)
  }

  protected auth: Auth

  protected getCookies () {
    return this.auth.getSavedCookies()
  }

  protected static async emulatePhone (page: puppeteer.Page, phone: string = 'iPhone 7') {
    await page.emulate(devices[phone])
  }

  protected async getCurrentBeanCount () {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://bean.m.jd.com/')
    const result = await page.$('span[type="Bold"]')
    const resultText = await page.evaluate(element => element.textContent, result)
    await page.close()
    return parseInt(resultText)
  }
}
