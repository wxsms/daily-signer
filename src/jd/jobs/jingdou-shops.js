const auth = require('../auth')
const chalk = require('chalk')
const cookies = auth.getSavedCookies()

module.exports = async function (browser) {
  console.log('开始店铺签到任务')
  const page = await browser.newPage()
  await page.setCookie(...cookies)
  await page.goto('https://bean.jd.com/myJingBean/list')
  await page.waitFor('.bean-shop-list')
  const list = await page.$$('.bean-shop-list > li')
  for (let i = 0; i < list.length; i++) {
    const link = await list[i].$('.s-name > a')
    const linkText = await page.evaluate(element => element.textContent, link)
    const href = await page.evaluate(element => element.getAttribute('href'), link)
    //console.log(linkText, href)
    const shopPage = await browser.newPage()
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
        console.log(linkText, chalk.green(successText))
      } else {
        console.log(linkText, '颗粒无收')
      }
    } else {
      console.log(linkText, chalk.gray('已签到'))
    }
  }
}
