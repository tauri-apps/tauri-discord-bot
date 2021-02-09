async function processCommands (message, context) {
  const content = message.content.slice(context.prefix.length)
  const [commandPart, ...parts] = content.split(' ')

  const command = Object.values(context.commands)
    .find(command => [command.name, ...command.aliases].includes(commandPart))

  if (command === undefined) {
    // const reply = `:warning: Invalid command... use\`${context.prefix}h\` for help ...`
    // message.reply(reply)
    return false
  }

  await command.execute(message, context, parts)
  return true
}

module.exports = processCommands
