const webAuth = require('./auth/web')
const users = require('../../../config/user.json').v2ex
const DailySign = require('./jobs/daily-sign')

async function _runWebJobs (user) {
  await new DailySign(user).saveRun()
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

module.exports = async function () {
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
