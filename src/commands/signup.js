const { request } = require('../request')
const config = require('../../src/configuration')
const inquirer = require('inquirer')
const { renderMessage } = require('../render')

const signup = async () => {
  let answers = {}
  answers = await inquirer
    .prompt([
      { type: 'input', message: '✉️  Email address', name: 'email' },
      { type: 'password', message: '🔑 Password', name: 'password' },
      { type: 'password', message: '🔑 Confirm password', name: 'confirmPassword' }
    ])
  const chosenEmail = answers.email
  while (answers.password !== answers.confirmPassword) {
    renderMessage('error', 'Passwords don\'t match!')
    answers = await inquirer
      .prompt([
        { type: 'password', message: '🔑 Password', name: 'password' },
        { type: 'password', message: '🔑 Confirm password', name: 'confirmPassword' }
      ])
  }
  answers.email = chosenEmail

  const res = await request({
    method: 'POST',
    url: `${config.get('apiBaseUrl')}/accounts`,
    body: {
      email: answers.email,
      password: answers.password
    }
  })

  if (res.statusCode >= 400) {
    return renderMessage('error', `❌ There was a problem with the credentials you provided (statusCode=${res.statusCode})`)
  }

  renderMessage('ok', '✉️  We sent an email to your inbox, click on the link to activate your account. After that, you will be able to log in with "apio account login"')

  return true
}

module.exports = { signup }
