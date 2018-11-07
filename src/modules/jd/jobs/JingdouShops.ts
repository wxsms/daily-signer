import { success, mute, error } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/WebJob'

export default class JingdouShops extends Job {
  constructor (user) {
    super(user)
    this.name = '网页端店铺每日签到'
  }

  protected _run = async () => {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://bean.jd.com/myJingBean/list')
    await page.waitFor('.bean-shop-list')
    const list = await page.$$('.bean-shop-list > li')
    for (let i = 0; i < list.length; i++) {
      const link = await list[i].$('.s-name > a')
      const linkText = await page.evaluate(element => element.textContent, link)
      try {
        const href = await page.evaluate(element => element.getAttribute('href'), link)
        //console.log(linkText, href)
        const shopPage = await this.browser.newPage()
        await abortUselessRequests(shopPage)
        await shopPage.setCookie(...this.cookies)
        await shopPage.goto(href)
        await shopPage.waitFor('.jSign')
        const unsignedLink = await shopPage.$('.unsigned')
        if (unsignedLink) {
          const unsignedHref = await shopPage.evaluate(element => element.getAttribute('url'), unsignedLink)
          //console.log(unsignedHref)
          await shopPage.goto('https://' + unsignedHref)
          const jingdou = await shopPage.$('.jingdou')
          if (jingdou) {
            const successText = await shopPage.evaluate(element => element.textContent, jingdou)
            console.log(linkText, success(successText))
          } else {
            console.log(linkText, '颗粒无收')
          }
        } else {
          console.log(linkText, mute('已签到'))
        }
        await shopPage.close()
      } catch (e) {
        console.log(linkText, error('任务失败'), error(e.message))
      }
    }
    await page.close()
  }
}
