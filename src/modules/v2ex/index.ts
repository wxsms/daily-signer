import * as webAuth from './auth/web'
import DailySign from './jobs/daily-sign'
import User from '../../interfaces/User'

const users = <User[]>require('../../../config/user.json').v2ex

async function _runWebJobs (user) {
  await new DailySign(user).run()
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

export default async function () {
  console.log('开始【V2EX】任务')
  for (let i = 0; i < users.length; i++) {
    const user = users[i]
    if (user.skip) {
      continue
    }
    console.log('用户：', user.username)
    await runWebJobs(user)
  }
  console.log('【V2EX】任务已全部完成')
  console.log('-----------------')
}
