const Configstore = require('configstore')
const version = require('../package.json').version

const defaultConfig = {
  // Apio IoT base url
  // The default value points to the SaaS version of the platform.
  // When using on-premise, users must change this value
  apiBaseUrl: 'https://api.apio.network',
  version: version,
  account: {
    fullName: null,
    email: null
  },
  defaultProjectId: null,
  projects: []
}
const config = new Configstore('@apio/cli', defaultConfig)
config.reset = () => {
  config.set(defaultConfig)
}

module.exports = config
