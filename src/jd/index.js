const puppeteer = require('puppeteer')
const webAuth = require('./auth/web')
const mobileAuth = require('./auth/mobile')
const users = require('../../config/user.json').jd

async function runMobileJobs (user) {
  await require('./jobs/jingdou-daily-m')(user)
}

async function runWebJobs (user) {
  await require('./jobs/jingdou-daily')(user)
  await require('./jobs/jingdou-shops')(user)
}

module.exports = async function () {
  console.log('开始京东商城任务')
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    if (user.skip) {
      continue
    }
    console.log('用户：', user.username)
    // jd mobile
    const mValid = await mobileAuth.checkCookieStillValid(user)
    if (mValid) {
      await runMobileJobs(user)
    } else {
      if (!user.skipLogin) {
        await mobileAuth.login(user)
        await runMobileJobs(user)
      }
    }
    // jd web
    const wValid = await webAuth.checkCookieStillValid(user)
    if (wValid) {
      await runWebJobs(user)
    } else {
      if (!user.skipLogin) {
        await webAuth.login(user)
        await runWebJobs(user)
      }
    }
  }
  console.log('任务已全部完成')
  console.log('-----------------')
}
