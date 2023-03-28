const open = require('open')
const terminalLink = require('terminal-link')
const documentationAddress = 'http://documentation.apio.network/'
module.exports = {
  command: 'documentation',
  desc: 'Open the web documentation',
  aliases: ['docs'],
  handler: (argv) => {
    console.log('\n📚 You can find the documentation at the following URL:')
    const link = terminalLink(documentationAddress, documentationAddress)
    console.log(`\n\t${link}`)
    open(documentationAddress)
  }
}
