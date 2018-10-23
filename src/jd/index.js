const path = require('path')
const fs = require('fs')
const puppeteer = require('puppeteer')
const chalk = require('chalk')
const auth = require('./auth')

module.exports = async function () {
  console.log('任务开始：京东商城')
  try {
    await auth.checkCookieStillValid(auth.getSavedCookies())
  } catch (e) {
    console.log('Cookies 未找到或已过期，尝试重新登录...')
    await auth.login()
  }
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1500,
      height: 768
    }
  })
  const jobsFiles = fs.readdirSync(path.join(__dirname, '/jobs'))
  for (let i = 0; i < jobsFiles.length; i++) {
    try {
      await require('./jobs/' + jobsFiles[i])(browser)
    } catch (e) {
      console.log(chalk.bold.red('任务失败'))
      console.error(e)
    }
  }
  console.log('任务已全部完成')
  console.log('-----------------')
}
