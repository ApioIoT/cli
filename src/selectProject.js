const { request } = require('./request')
const config = require('../src/configuration')
const inquirer = require('inquirer')
const { renderError } = require('./render')
const keytar = require('keytar')
async function createFristProject () {
  // const token = config.get('account.token')
  const token = await keytar.getPassword('@apio/iot', 'default')
  const answers = await inquirer
    .prompt([
      { type: 'input', message: 'Select a name for your project', name: 'name' }
    ])

  const res = await request({
    method: 'POST',
    url: `${config.get('apiBaseUrl')}/projects`,
    headers: {
      authorization: `bearer ${token}`
    },
    body: {
      name: answers.name
    }
  })

  config.set('projects', [res.body.data])
  config.set('defaultProjectId', res.body.data.uuid)
}

const selectProject = async () => {
  const token = await keytar.getPassword('@apio/iot', 'default')
  const res = await request({
    method: 'GET',
    url: `${config.get('apiBaseUrl')}/projects`,
    headers: {
      authorization: `bearer ${token}`
    }
  })

  if ((res.body && res.body.data && res.body.data.length === 0)) {
    // Non ha progetti, vanno creati
    return await createFristProject()
  } else {
    config.set('projects', res.body.data.map(project => {
      return { uuid: project.uuid, name: project.name }
    }))
  }

  const defaultProject = config.get('defaultProjectId')

  if (!defaultProject) {
    const answers = await inquirer
      .prompt([
        { type: 'list', message: 'Select your default project', name: 'projectName', choices: config.get('projects').map(project => project.name) }
      ])
    const selected = config.get('projects').find(proj => proj.name === answers.projectName)
    config.set('defaultProjectId', selected.uuid)
  }
}

async function requireSelectedProject () {
  const defaultProjectId = config.get('defaultProjectId')
  const token = await keytar.getPassword('@apio/iot', 'default')
  if (token && !defaultProjectId) {
    try {
      await selectProject()
    } catch (e) {
      renderError(e)
      process.exit(1)
    }
  }
}

module.exports = { selectProject, requireSelectedProject, createFristProject }
