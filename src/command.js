const fs = require('fs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const keytar = require('keytar')
const debug = require('debug')('@apio/cli')
const config = require('./configuration')
const { request } = require('./request')
const { renderList, renderObject, renderMessage } = require('./render')
const { requireAuthentication } = require('./authenticate')
const { requireSelectedProject } = require('./selectProject')
const { Column } = require('./column')
const defaultAuctionList = ['get', 'list', 'delete', 'create', 'update']
const defaultColumns = ['uuid', 'name', 'description']

/**
 * Builds a command
 * @param {Object} config
 * @param {String} config.resourceSingularName singular name of the resource
 * @param {String} config.resourcePluralName plural name of the resource
 * @param {Array<String>} config.actions array of action names
 * @param {Array<String>} config.columns array of column names
 * @param {Object} config.additionalActions object of additional actions
 * @param {Array<String>} config.aliases aliases to the command
 * @returns
 */
function getCRUDCommand ({
  resourceSingularName,
  resourcePluralName,
  actions = defaultAuctionList,
  columns = defaultColumns,
  additionalActions = {},
  aliases
}) {
  if (additionalActions) {
    actions = actions.concat(Object.keys(additionalActions))
  }
  const ctrl = {}

  columns = columns.map(column => {
    if (!(column instanceof Column)) {
      return new Column(column)
    } else {
      return column
    }
  })
  function getBaseUrl () {
    const projectId = config.get('defaultProjectId')
    let baseUrl = `${config.get('apiBaseUrl')}/projects/${projectId}/${resourcePluralName}`
    if (resourcePluralName === 'projects') {
      baseUrl = `${config.get('apiBaseUrl')}/projects`
    }
    return baseUrl
  }
  ctrl.list = async function list (params, filters) {
    debug('Command.list')

    let view = 'table'
    if (filters.view) {
      view = filters.view
    }
    delete filters.view
    if (!filters.fields) {
      filters.fields = columns.map(c => c.name).join(',')
    } else if (filters.fields === 'all') {
      delete filters.fields
    }
    const baseUrl = getBaseUrl()
    const token = await keytar.getPassword('@apio/iot', 'default')
    const res = await request({
      method: 'GET',
      url: `${baseUrl}/`,
      query: filters,
      headers: {
        authorization: `bearer ${token}`
      }
    })
    if (filters.fields) {
      const fields = filters.fields.split(',')
      const existingColumns = columns.filter(c => fields.includes(c.name))
      const nonExistingColumns = fields.filter(f => !columns.map(c => c.name).includes(f)).map(field => new Column(field))
      columns = [].concat(existingColumns).concat(nonExistingColumns)
    }
    if (view === 'table') {
      renderList(res.body.data, columns)
    } else if (view === 'full') {
      renderObject(res.body.data)
    } else if (view === 'json') {
      console.log(JSON.stringify(res.body.data, null, 2))
    } else {
      renderMessage('warn', `Unrecognized view mode "${view}", defaulting to "table". Available modes: full, table.`)
      renderList(res.body.data, columns)
    }
  }

  ctrl.get = async function get (params, filters) {
    debug('Command.get')
    if (params.length !== 1) {
      console.log(`Usage: apio ${resourcePluralName} get <${resourceSingularName}Id>`)
      console.log(`\nFetch ${resourcePluralName} by uuid`)
      process.exit(1)
    }
    const baseUrl = getBaseUrl()
    const token = await keytar.getPassword('@apio/iot', 'default')
    const res = await request({
      method: 'GET',
      url: `${baseUrl}/${params[0]}`,
      query: filters,
      headers: {
        authorization: `bearer ${token}`
      }
    })
    if (res.statusCode === 404) {
      console.log(`${chalk.yellow(404)} Cannot find ${resourceSingularName} with uuid=${params[0]}`)
      process.exit(1)
    }
    renderObject(res.body.data)
  }
  ctrl.create = async function create (params, resource) {
    debug('Command.create')
    if (params && params[0] && params[0][0] === '@') {
      const givenPath = params[0].slice(1)
      if (!fs.existsSync(givenPath)) {
        return renderMessage('error', `File ${givenPath} does not exist`)
      }
      const str = fs.readFileSync(givenPath)
      resource = Object.assign({}, JSON.parse(str), resource)
    }
    const baseUrl = getBaseUrl()
    const token = await keytar.getPassword('@apio/iot', 'default')
    const res = await request({
      method: 'POST',
      url: `${baseUrl}`,
      body: resource,
      headers: {
        authorization: `bearer ${token}`
      }
    })
    if (res.statusCode < 400) {
      renderObject(res.body.data)
    } else {
      renderObject(res.body.error)
    }
  }
  ctrl.update = async function create (params, resource) {
    debug('Command.update')
    if (params && params[1] && params[1][0] === '@') {
      const givenPath = params[1].slice(1)
      if (!fs.existsSync(givenPath)) {
        return renderMessage('error', `File ${givenPath} does not exist`)
      }
      const str = fs.readFileSync(givenPath)
      resource = Object.assign({}, JSON.parse(str), resource)
    }
    const baseUrl = getBaseUrl()
    const token = await keytar.getPassword('@apio/iot', 'default')
    const res = await request({
      method: 'PUT',
      url: `${baseUrl}/${params[0]}`,
      body: resource,
      headers: {
        authorization: `bearer ${token}`
      }
    })
    if (res.statusCode < 400) {
      renderObject(res.body.data)
    } else {
      renderObject(res.body.error)
    }
  }

  ctrl.delete = async function del (params) {
    debug('Command.delete')
    const answers = await inquirer
      .prompt([
        { type: 'confirm', message: 'This will remove data, are you sure?', name: 'confirm', default: false }
      ])
    if (!answers.confirm) {
      return
    }
    const baseUrl = getBaseUrl()
    const token = await keytar.getPassword('@apio/iot', 'default')
    const res = await request({
      method: 'DELETE',
      url: `${baseUrl}/${params[0]}`,
      headers: {
        authorization: `bearer ${token}`
      }
    })
    if (res.statusCode < 400) {
      renderMessage('ok', 'Resource successfully deleted')
    } else {
      renderMessage('error', `Something went wrong: ${res.body.error.message}`)
    }
  }

  for (const additionalActionName in additionalActions) {
    ctrl[additionalActionName] = additionalActions[additionalActionName]
  }

  async function handler ({ action, params, ...additionalParams }) {
    debug('Command.handler')
    await requireAuthentication()
    await requireSelectedProject()

    if (!actions.includes(action)) {
      return renderMessage('error', `Unkown action ${action}.\n`)
    }

    if (!ctrl[action]) {
      return renderMessage('error', `Action ${action} is not implemented.\n`)
    }
    const p = Object.assign({}, additionalParams)
    delete p._
    delete p.$0
    return ctrl[action](params, p)
  }
  return {
    command: `${resourcePluralName} <action> [params...]`,
    describe: `Manage ${resourcePluralName}. `,
    handler: handler,
    aliases: aliases || [resourcePluralName.slice(0, 3)],
    builder: {
      action: {
        desc: 'The action to perform',
        demand: true,
        choices: actions,
        default: 'list'
      },
      params: {
        desc: 'Action parameters',
        demand: false,
        array: true
      }
    }
  }
}

module.exports = { getCRUDCommand }
