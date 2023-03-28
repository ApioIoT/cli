const keytar = require('keytar')
const inquirer = require('inquirer')
inquirer.registerPrompt('date', require('inquirer-date-prompt'))
const debug = require('debug')('@apio/cli')
const { request } = require('../request')
const config = require('../configuration')
const { renderList, renderObject, renderMessage } = require('../render')

function makeTableFromData (data) {
  const rows = {}
  const columns = ['time']
  const deviceIds = Object.keys(data)

  for (const deviceId in data) {
    for (const propertyName in data[deviceId]) {
      let key = `${deviceId}_${propertyName}`
      if (deviceIds.length === 1) {
        key = propertyName
      }
      columns.push(key)
      data[deviceId][propertyName].forEach(point => {
        const [time, value] = point
        rows[time] = rows[time] || { time }
        rows[time][key] = value
      })
    }
  }

  return {
    rows: Object.values(rows),
    columns
  }
}

async function query (params, filters) {
  debug('Command.list')
  let view = 'table'
  if (filters.view) {
    view = filters.view
  }
  delete filters.view
  const token = await keytar.getPassword('@apio/iot', 'default')
  const projectId = config.get('defaultProjectId')
  const res = await request({
    method: 'GET',
    url: `${config.get('apiBaseUrl')}/projects/${projectId}/telemetry`,
    query: filters,
    headers: {
      authorization: `bearer ${token}`
    }
  })

  const data = res.body.data

  if (view === 'table') {
    const df = makeTableFromData(data)
    renderList(df.rows, df.columns)
  } else if (view === 'full') {
    renderObject(data)
  } else if (view === 'json') {
    console.log(JSON.stringify(data, null, 2))
  } else {
    renderMessage('warn', `Unrecognized view mode "${view}", defaulting to "table". Available modes: full, json, table.`)
    const df = makeTableFromData(data)
    renderList(df.rows, df.columns)
  }
}

async function gatherPlantTelemetryQueryParams () {
  const token = await keytar.getPassword('@apio/iot', 'default')
  const projectId = config.get('defaultProjectId')
  let response = await request({
    method: 'GET',
    url: `${config.get('apiBaseUrl')}/projects/${projectId}/plants`,
    query: { fields: 'name,uuid' },
    headers: {
      authorization: `bearer ${token}`
    }
  })

  const plants = response.body.data.map(plant => { return { name: plant.name, value: plant.uuid } })

  let answers = await inquirer
    .prompt([
      { type: 'list', message: 'Select a plant', name: 'plantId', choices: plants }
    ])

  const plantId = answers.plantId

  response = await request({
    method: 'GET',
    url: `${config.get('apiBaseUrl')}/projects/${projectId}/devices`,
    query: { fields: 'name,uuid,state', plantId },
    headers: {
      authorization: `bearer ${token}`
    }
  })

  const devices = response.body.data
  const deviceChoices = response.body.data.map(device => { return { name: device.name, value: device.uuid } })

  answers = await inquirer
    .prompt([
      { type: 'checkbox', message: 'Select devices', name: 'deviceId', choices: deviceChoices }
    ])

  const deviceIds = answers.deviceId
  const chosenDevices = devices.filter(d => deviceIds.includes(d.uuid))
  const propertyNames = [...new Set(chosenDevices.map(d => Object.keys(d.state)).flat())]

  answers = await inquirer
    .prompt([
      { type: 'checkbox', message: 'Select properties', name: 'propertyNames', choices: propertyNames }
    ])

  const selectedPropertyNames = answers.propertyNames

  answers = await inquirer
    .prompt([
      { type: 'date', message: 'Select the lower time bound (from)', name: 'timeFrom' },
      { type: 'date', message: 'Select the upper time bound (to)', name: 'timeTo' }
    ])

  return { name: selectedPropertyNames, deviceId: deviceIds, timeFrom: answers.timeFrom.toISOString(), timeTo: answers.timeTo.toISOString() }
}

async function handler ({ action, params, ...additionalParams }) {
  const p = Object.assign({}, additionalParams)
  if (action === 'query') {
    await query(params, p)
  } else if (action === 'query-plants') {
    const filters = await gatherPlantTelemetryQueryParams()
    renderMessage('info', `This command is also available as:\napio telemetry query ${filters.deviceId.map(d => ` --deviceId ${d}`).join(' ')} ${filters.name.map(n => ` --name ${n}`).join(' ')} --timeFrom ${filters.timeFrom} --timeTo ${filters.timeTo}\n\n`)
    await query(params, filters)
  }
}

module.exports = {
  command: 'telemetry <action>',
  describe: 'View telemetry data',
  handler: handler,
  builder: {
    action: {
      desc: 'The action to perform',
      demand: true,
      choices: ['query', 'query-plants'],
      default: 'query'
    }
  }
}
