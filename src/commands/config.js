const config = require('../configuration')
const { renderObject, renderError, renderMessage } = require('../render')

async function set (params) {
  const [key, value] = params
  config.set(key, value)
  renderMessage('ok', 'Configuration updated! New config is:')
  const configuration = config.get()
  renderObject(configuration)
}

async function get (params) {
  const configuration = config.get()
  renderMessage('info', `You can find the config file at ${config.path}`)
  renderObject(configuration)
}

function handler ({ action, params }) {
  switch (action) {
    case 'set':
      return set(params)
    case 'get':
      return get(params)
    default: {
      renderError(new Error('Unkown action'))
    }
  }
}

module.exports = {
  command: 'config <action> [params...]',
  describe: 'Manage Apio CLI configuration. To set the foo key use "apio config set foo bar". To Unset it: "apio config set foo".',
  handler: handler,
  builder: {
    action: {
      demand: true,
      choices: ['get', 'set'],
      default: 'get'
    },
    params: {
      demand: true,
      array: true
    }
  }
}
