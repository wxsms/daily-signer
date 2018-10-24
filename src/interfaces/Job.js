const {error} = require('../utils/log')
const {getBrowser} = require('../utils/browser')

class Job {
  constructor (user) {
    this.user = user
    this.browser = getBrowser()
    this.name = null
  }

  async saveRun () {
    console.log(`开始【${this.name}】任务`)
    try {
      this.cookies = this.getCookies(this.user)
      await this.run()
    } catch (e) {
      console.log(error('任务失败'), error(e.message))
    }
  }
}

module.exports = Job
