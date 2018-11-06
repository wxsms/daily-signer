import * as path from 'path'
import { createCanvas, Image } from 'canvas'
import { abortUselessRequests } from '../../../utils/puppeteer'
import md5 from '../../../utils/md5'
import { combineRgba, tolerance } from '../../../utils/canvas'
import Auth from '../../../interfaces/Auth'

function getVerifyPosition (base64: string, actualWidth: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const canvas = createCanvas(1000, 1000)
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      const width: number = img.naturalWidth
      const height: number = img.naturalHeight
      ctx.drawImage(img, 0, 0)
      const maskRgba: number[] = [0, 0, 0, 0.65]
      const t: number = 10 // 色差容忍值
      let prevPixelRgba = null
      for (let x = 0; x < width; x++) {
        // 重新开始一列，清除上个像素的色值
        prevPixelRgba = null
        for (let y = 0; y < height; y++) {
          const rgba = ctx.getImageData(x, y, 1, 1).data
          if (prevPixelRgba) {
            // 所有原图中的 alpha 通道值都是1
            prevPixelRgba[3] = 1
            const maskedPrevPixel = combineRgba(prevPixelRgba, maskRgba)
            // 只要找到了一个色值匹配的像素点则直接返回，因为是自上而下，自左往右的查找，第一个像素点已经满足"最近"的条件
            if (tolerance(maskedPrevPixel, rgba, t)) {
              resolve(x * actualWidth / width)
              return
            }
          } else {
            prevPixelRgba = rgba
          }
        }
      }
      // 没有找到任何符合条件的像素点
      resolve(0)
    }
    img.onerror = reject
    img.src = base64
  })
}

export default class WebAuth extends Auth {
  constructor (user) {
    super(user)
    this.canAutoLogin = Boolean(user.password && user.username)
  }

  protected getCookiePath () {
    return path.join(process.cwd(), 'temp', md5('cookies-jd' + this.user.username))
  }

  protected async _login (page) {
    await page.goto('https://passport.jd.com/new/login.aspx')
    // 切换到用户名、密码登录tab
    await page.click('.login-tab.login-tab-r > a')
    // 自动填写表单
    this.user.username && await page.$eval('#loginname', (el, value) => el.setAttribute('value', value), this.user.username)
    this.user.password && await page.$eval('#nloginpwd', (el, value) => el.setAttribute('value', value), this.user.password)
    if (this.canAutoLogin) {
      await page.click('#loginsubmit')
      await page.waitFor(1000)
      // 需要验证码
      let tryTimes: number = 0
      // 最多尝试20次
      while (++tryTimes < 20 && await page.$('.JDJRV-bigimg')) {
        console.log(`正在尝试通过验证码（第${tryTimes}次）`)
        // 验证码图片（带缺口）
        const img = await page.$('.JDJRV-bigimg > img')
        // 获取缺口左x坐标
        const distance: number = await getVerifyPosition(
          await page.evaluate(element => element.getAttribute('src'), img),
          await page.evaluate(element => parseInt(window.getComputedStyle(element).width), img)
        )

        /*
        // debug 用：在页面上展示找到的位置
        await page.evaluate(distance => {
          var mark = document.createElement('div')
          mark.style.height = '10px'
          mark.style.width = '10px'
          mark.style.position = 'absolute'
          mark.style.left = distance + 'px'
          mark.style.top = '0px'
          mark.style.backgroundColor = 'green'
          document.querySelector('.JDJRV-bigimg').appendChild(mark)
        }, distance)
        await page.waitFor(2000)
        */

        // 滑块
        const dragBtn = await page.$('.JDJRV-slide-btn')
        const dragBtnPosition = await page.evaluate(element => {
          // 此处有 bug，无法直接返回 getBoundingClientRect()
          const {x, y, width, height} = element.getBoundingClientRect()
          return {x, y, width, height}
        }, dragBtn)
        // 按下位置设置在滑块中心
        const x: number = dragBtnPosition.x + dragBtnPosition.width / 2
        const y: number = dragBtnPosition.y + dragBtnPosition.height / 2

        if (distance > 10) {
          // 如果距离够长，则将距离设置为二段（模拟人工操作）
          const distance1: number = distance - 10
          const distance2: number = 10
          await page.mouse.move(x, y)
          await page.mouse.down()
          // 第一次滑动
          await page.mouse.move(x + distance1, y, {steps: 30})
          await page.waitFor(500)
          // 第二次滑动
          await page.mouse.move(x + distance1 + distance2, y, {steps: 20})
          await page.waitFor(500)
          await page.mouse.up()
        } else {
          // 否则直接滑到相应位置
          await page.mouse.move(x, y)
          await page.mouse.down()
          await page.mouse.move(x + distance, y, {steps: 30})
          await page.mouse.up()
        }
        // 等待验证结果
        await page.waitFor(3000)
      }
    }
    // 等待用户登录成功，页面将跳转到 jd.com
    await page.waitForFunction('window.location.href.indexOf("https://www.jd.com") >= 0', {timeout: 0})
  }

  protected async _check (page) {
    await abortUselessRequests(page)
    await page.goto('https://order.jd.com/center/list.action')
    return await page.$('body[myjd="_MYJD_ordercenter"]') !== null
  }
}
