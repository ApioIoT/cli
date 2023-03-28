const { authenticate } = require('../authenticate')
const { signup } = require('./signup')
const config = require('../configuration')

async function login () {
  await authenticate()
}
function logout () {
  config.reset()
}

async function handler ({ action, params, ...additionalParams }) {
  if (action === 'login') {
    await login()
  } else if (action === 'logout') {
    await logout()
  } else if (action === 'signup' || action === 'create') {
    await signup()
  }
}

module.exports = {
  command: 'account <action>',
  describe: 'Manage your account. ',
  handler: handler,
  builder: {
    action: {
      desc: 'The action to perform',
      demand: true,
      choices: ['login', 'logout', 'create'],
      default: 'login'
    }
  }
}
