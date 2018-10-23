const auth = require('../auth')

module.exports = async function (browser) {
  console.log('开始店铺签到任务')
  const page = await browser.newPage()
  await page.setCookie(...auth.getSavedCookies())
  await page.goto('https://bean.jd.com/myJingBean/list')
  await page.waitFor('.bean-shop-list')
  const list = await page.$$('.bean-shop-list > li')
  for (let i = 0; i < list.length; i++) {
    const received = await list[i].$('.s-received')
    if (received !== null) {
      continue
    }
    const link = await list[i].$('.s-name > a')
    const linkText = await page.evaluate(element => element.textContent, link)
    const href = await (await link.getProperty('href')).jsonValue()
    console.log(linkText, href)
    const shopPage = await browser.newPage()
    await shopPage.setCookie(...auth.getSavedCookies())
    await shopPage.goto(href)
    await shopPage.waitFor('.unsigned')
    const unsignedLink = await shopPage.$('.unsigned')
    if (unsignedLink) {
      const unsignedHref = await shopPage.evaluate(element => element.getAttribute('url'), unsignedLink)
      //console.log(unsignedHref)
      await shopPage.goto('https://' + unsignedHref)
      const jingdou = await shopPage.$('.jingdou')
      if (jingdou) {
        const successText = await shopPage.evaluate(element => element.textContent, jingdou)
        console.log(successText)
      } else {
        console.log('颗粒无收')
      }
    }
  }
}
