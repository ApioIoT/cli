const { request } = require('./request')
const config = require('../src/configuration')
const inquirer = require('inquirer')
const { renderMessage } = require('./render')
const { createFristProject } = require('./selectProject')
const keytar = require('keytar')
const authenticate = async () => {
  const answers = await inquirer
    .prompt([
      { type: 'input', message: '✉️  Email address', name: 'email' },
      { type: 'password', message: '🔑 Password', name: 'password' }
    ])
  const res = await request({
    method: 'POST',
    url: `${config.get('apiBaseUrl')}/accounts/authenticate`,
    body: {
      email: answers.email,
      password: answers.password
    }
  })

  if (res.statusCode === 401) {
    return renderMessage('error', 'The credentials you provided were rejected.')
  } else if (res.statusCode >= 400) {
    return renderMessage('error', 'There was a problem with the credentials you provided. ' + res.statusCode)
  }

  config.set('account', {
    email: res.body.data.account.email,
    fullName: res.body.data.account.fullName
  })
  await keytar.setPassword('@apio/iot', 'default', res.body.data.token)

  renderMessage('ok', 'Login was successful!')

  if (res.body.data.roles.length === 0) {
    // Create first project
    renderMessage('info', 'Looks like you have no projects, let\'s create the first one.')
    await createFristProject()
    return
  }

  config.set('projects', res.body.data.projects.map(p => ({ uuid: p.uuid, name: p.name, description: p.description })))
  const projects = res.body.data.projects
  if (!config.has('defaultProjectId')) {
    config.set('defaultProjectId', projects[0].uuid)
    renderMessage('info', `The project ${projects[0].name} was made default project. You can change it with the "apio projects set-default <uuid>" command.`)
  } else {
    const projectIds = projects.map(p => p.uuid)
    const previousDefaultId = config.get('defaultProjectId')
    if (!projectIds.includes(previousDefaultId)) {
      renderMessage('warn', `Your previous default project with uuid=${previousDefaultId} is no longer available. The project "${projects[0].name}" was made default project. You can change it with the "apio projects set-default <uuid>" command.`)
      config.set('defaultProjectId', projects[0].uuid)
    }
  }

  return true
}

function requireAuthentication (argv) {
  const account = config.get('account')
  if (!(account && account.email)) {
    renderMessage('info', 'You are currently not logged in, let\'s login first with "apio account login"')
    process.exit(1)
  }
}

module.exports = { authenticate, requireAuthentication }
