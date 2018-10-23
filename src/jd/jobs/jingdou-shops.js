const auth = require('../auth/web')
const cookies = auth.getSavedCookies()
const {success, error, mute} = require('../../utils/log')
const {abortUselessRequests} = require('../../utils/puppeteer')

module.exports = async function (browser) {
  console.log('开始店铺签到任务')
  try {
    const page = await browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...cookies)
    await page.goto('https://bean.jd.com/myJingBean/list')
    await page.waitFor('.bean-shop-list')
    const list = await page.$$('.bean-shop-list > li')
    for (let i = 0; i < list.length; i++) {
      const link = await list[i].$('.s-name > a')
      const linkText = await page.evaluate(element => element.textContent, link)
      try {
        const href = await page.evaluate(element => element.getAttribute('href'), link)
        //console.log(linkText, href)
        const shopPage = await browser.newPage()
        await abortUselessRequests(shopPage)
        await shopPage.setCookie(...cookies)
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
            console.log('  -', linkText, success(successText))
          } else {
            console.log('  -', linkText, '颗粒无收')
          }
        } else {
          console.log('  -', linkText, mute('已签到'))
        }
      } catch (e) {
        console.log('  -', linkText, error('任务失败'), error(e.message))
      }
    }
  } catch (e) {
    console.log(error('任务失败'), error(e.message))
  }
}
