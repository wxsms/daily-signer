import WebAuth from './auth/WebAuth'
import MobileAuth from './auth/MobileAuth'
import JingdouDaily from './jobs/JingdouDaily'
import JingdouShops from './jobs/JingdouShops'
import JingdouDailyMobile from './jobs/JingdouDailyMobile'
import JinrongDaily from './jobs/JinrongDaily'
import DoubleSign from './jobs/DoubleSign'
import JingdouZhuanpanMobile from './jobs/JingdouZhuanpanMobile'
import FuliDailyMobile from './jobs/FuliDailyMobile'
import JinrongZhuanqianMobile from './jobs/JinrongZhuanqianMobile'
import User from '../../interfaces/User'
import config from '../../config/index'

const users = <User[]>config.jd

async function _runMobileJobs (user) {
  await new JingdouDailyMobile(user).run()
  await new FuliDailyMobile(user).run()
  await new JingdouZhuanpanMobile(user).run()
  await new DoubleSign(user).run()
  await new JinrongZhuanqianMobile(user).run()
}

async function _runWebJobs (user) {
  await new JingdouDaily(user).run()
  await new JingdouShops(user).run()
  await new JinrongDaily(user).run()
}

async function runWebJobs (user) {
  const auth = new WebAuth(user)
  if (await auth.check()) {
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
  if (await auth.check()) {
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
