import WebAuth from './auth/WebAuth'
import MobileAuth from './auth/MobileAuth'
import JingdouDaily from './jobs/jingdou-daily'
import JingdouShops from './jobs/jingdou-shops'
import JongdouDailyMobile from './jobs/jingdou-daily-m'
import JinrongDaily from './jobs/jinrong-daily'
import DoubleSign from './jobs/double-sign'
import JingdouZhuanpanMobile from './jobs/jingdou-zhuanpan-m'
import User from '../../interfaces/User'

const users = <User[]>require('../../../config/user.json').jd

async function _runMobileJobs (user) {
  await new JongdouDailyMobile(user).run()
  await new JingdouZhuanpanMobile(user).run()
  await new DoubleSign(user).run()
}

async function _runWebJobs (user) {
  await new JingdouDaily(user).run()
  await new JingdouShops(user).run()
  await new JinrongDaily(user).run()
}

async function runWebJobs (user) {
  const auth = new WebAuth(user)
  const wValid = await auth.check()
  if (wValid) {
    await _runWebJobs(user)
  } else {
    if (!user.skipLogin) {
      await auth.login()
      await _runWebJobs(user)
    }
  }
}

async function runMobileJobs (user) {
  const auth = new MobileAuth(user)
  const mValid = await auth.check()
  if (mValid) {
    await _runMobileJobs(user)
  } else {
    if (!user.skipLogin) {
      await auth.login()
      await _runMobileJobs(user)
    }
  }
}

export default async function () {
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
