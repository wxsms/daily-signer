const webAuth = require('./auth/web')
const mobileAuth = require('./auth/mobile')
const users = require('../../../config/user.json').jd
const JingdouDaily = require('./jobs/jingdou-daily')
const JingdouShops = require('./jobs/jingdou-shops')
const JongdouDailyMobile = require('./jobs/jingdou-daily-m')
const JinrongDaily = require('./jobs/jinrong-daily')
const doubleSign = require('./jobs/double-sign')
const JingdouZhuanpanMobile = require('./jobs/jingdou-zhuanpan-m')

async function _runMobileJobs (user) {
  await new JongdouDailyMobile(user).saveRun()
  await new JingdouZhuanpanMobile(user).saveRun()
  await new doubleSign(user).saveRun()
}

async function _runWebJobs (user) {
  await new JingdouDaily(user).saveRun()
  await new JingdouShops(user).saveRun()
  await new JinrongDaily(user).saveRun()
}

async function runWebJobs (user) {
  const wValid = await webAuth.checkCookieStillValid(user)
  if (wValid) {
    await _runWebJobs(user)
  } else {
    if (!user.skipLogin) {
      await webAuth.login(user)
      await _runWebJobs(user)
    }
  }
}

async function runMobileJobs (user) {
  const mValid = await mobileAuth.checkCookieStillValid(user)
  if (mValid) {
    await _runMobileJobs(user)
  } else {
    if (!user.skipLogin) {
      await mobileAuth.login(user)
      await _runMobileJobs(user)
    }
  }
}

module.exports = async function () {
  console.log('开始【京东商城】任务')
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    if (user.skip) {
      continue
    }
    console.log('用户：', user.username)
    await runWebJobs(user)
    await runMobileJobs(user)
  }
  console.log('【京东商城】任务已全部完成')
  console.log('-----------------')
}
