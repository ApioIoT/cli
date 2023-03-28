#!/usr/bin/env node
const yargs = require('yargs')
const { hideBin } = require('yargs/helpers')

const commands = {
  assets: require('./src/commands/assets'),
  assettypes: require('./src/commands/assettypes'),
  aclrules: require('./src/commands/aclrules'),
  apikeys: require('./src/commands/apikeys'),
  config: require('./src/commands/config'),
  devices: require('./src/commands/devices'),
  devicetypes: require('./src/commands/devicetypes'),
  nodetypes: require('./src/commands/nodetypes'),
  nodes: require('./src/commands/nodes'),
  plants: require('./src/commands/plants'),
  projects: require('./src/commands/projects'),
  roles: require('./src/commands/roles'),
  telemetry: require('./src/commands/telemetry'),
  events: require('./src/commands/events'),
  account: require('./src/commands/account'),
  documentation: require('./src/commands/documentation')
}
yargs(hideBin(process.argv)) // eslint-disable-line no-unused-expressions
  .help()
  .detectLocale(false)
  .command(commands.config)
  .command(commands.projects)
  .command(commands.assets)
  .command(commands.assettypes)
  .command(commands.plants)
  .command(commands.devices)
  .command(commands.devicetypes)
  .command(commands.nodetypes)
  .command(commands.nodes)
  .command(commands.roles)
  .command(commands.aclrules)
  .command(commands.telemetry)
  .command(commands.events)
  .command(commands.apikeys)
  .command(commands.account)
  .command(commands.documentation)
  .demandCommand()
  .recommendCommands()
  .showHelpOnFail(true)
  .argv
