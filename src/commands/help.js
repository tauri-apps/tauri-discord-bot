const { getEmbeddedMessage } = require('../utils')

module.exports = {
  name: 'help',
  aliases: ['h'],
  desc: 'Shows help',
  examples: [
    '[shows this data in a DM]'
  ],
  async execute (message, context) {
    const { commands } = context
    let text = ''
    text += '\n**Commands:**' +
      `\n• ${getCommandInfo(context.prefix, commands.help)}` +
      `\n• ${getCommandInfo(context.prefix, commands.search)}` +
      `\n• ${getCommandInfo(context.prefix, commands.describe)}` +
      `\n• ${getCommandInfo(context.prefix, commands.appExt)}` +
      '\n' +
      '\n**Examples:**'
    ;[commands.help, commands.search, commands.describe, commands.appExt, commands.stats].forEach(command => {
      command.examples.forEach(example => {
        text += `\n• \`${context.prefix}${command.name}\` ${example}`
      })
    })
    text += '\n'

    const embed = getEmbeddedMessage(message, context, 'Help')
      .setDescription(text)

    if (context.isMentioned) {
      await message.channel.send({ embed })
    } else {
      await message.author.send({ embed })
    }

    await message.react('📨')
  }
}

const getCommandInfo = (prefix, command) => {
  return `${prefix}${[command.name, ...command.aliases].join(` or ${prefix}`)}`
}
