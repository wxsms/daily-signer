const chalk = require('chalk')

module.exports = {
  error: chalk.bold.red,
  warning: chalk.keyword('orange'),
  success: chalk.green,
  mute: chalk.gray
}
