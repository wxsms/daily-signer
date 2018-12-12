import { success, mute, error } from '../../../utils/log'
import { abortUselessRequests } from '../../../utils/puppeteer'
import Job from '../interfaces/MobileJob'

async function doWheel (page) {
  const btn = await page.$('.wheel_pointer_wrap')
  await btn.tap()
  const res = await page.waitForResponse(res => res.url().startsWith('https://api.m.jd.com/client.action?functionId=babelGetLottery') && res.status() === 200)
  try {
    const resJson = JSON.parse((await res.text()).replace(/^jsonp2\(/, '').replace(/\)$/, ''))
    console.log(success(resJson.promptMsg), success(resJson.prizeName))
  } catch (e) {
    console.log(error(e.message))
  }
}

export default class JingdouZhuanpanMobile extends Job {
  constructor (user) {
    super(user)
    this.name = '移动端京豆转福利'
  }

  protected _run = async () => {
    const page = await this.browser.newPage()
    await abortUselessRequests(page)
    await page.setCookie(...this.cookies)
    await page.goto('https://bean.m.jd.com/')
    // 模态框会导致目标元素点不到，将它处理掉
    await page.addStyleTag({content: '.modal{z-index: -1 !important;display: none !important;}'})
    const linkHandlers = await page.$x('//span[contains(text(), \'转福利\')]//ancestor::div[@accessible]')
    if (linkHandlers.length > 0) {
      //console.log(await page.evaluate(element => element.textContent, linkHandlers[0]))
      await linkHandlers[0].tap()
      await page.waitForFunction('window.location.href.indexOf("https://pro.m.jd.com/mall/active/") >= 0')
      await page.waitFor('.wheel_chance')
      await page.waitForFunction('document.querySelector(".wheel_chance").textContent !== ""')
      const chanceTextFull = await page.evaluate(element => element.textContent.replace(/[ \r\n]/g, ''), await page.$('.wheel_chance_wrap'))
      const chanceText = await page.evaluate(element => element.textContent, await page.$('.wheel_chance'))
      if (chanceText === '0') {
        // 已用完次数
        console.log(mute(chanceTextFull))
      } else {
        // 可以抽奖
        console.log(success(chanceTextFull))
        const chanceInt = parseInt(chanceText)
        for (let i = 0; i < chanceInt; i++) {
          await doWheel(page)
          await page.reload({waitUntil: 'networkidle0'})
        }
      }
    } else {
      console.log(mute('未找到活动入口'))
    }
    //await page.waitFor(9999999, {timeout: 0})
    await page.close()
  }
}
