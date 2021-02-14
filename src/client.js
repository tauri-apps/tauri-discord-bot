const Discord = require('discord.js')

const { name, version } = require('../package.json')

const processCommands = require('./process_commands')
const commands = require('./commands')
const count = require('./count')

const { getUserFromMention } = require('./utils')

module.exports = async ({ apiKey, token, prefix, searchIndex, site, icon, limit }) => {
  const client = new Discord.Client()

  const versions = {
    self: version,
    node: process.version,
    discord: Discord.version
  }

  client.on('ready', () => {
    console.log(`[${name} (v${versions.self}) is online | Node: ${versions.node} | Discord.js: ${versions.discord}]\nConnected as: ${client.user.username} (ID: ${client.user.id})\nServers Connected: ${client.guilds.cache.size}`)
    client.user.setActivity(`${prefix}${commands.search.aliases[0]} {search terms}`, { type: 'LISTENING' })
  })

  client.on('message', async message => {
    if (message.author.bot || message.system) return
    if (message.content.startsWith(prefix) !== true) return

    // log command
    console.log(message.content)

    let isMentioned = false
    // Extract mentions from message content
    const mentionedUsers = []
    const splittedMessage = message.content.split(/ +/)
    for (const chunk of splittedMessage) {
      const user = getUserFromMention(client, chunk)
      if (!user) continue

      // Strip out the mention
      message.content = message.content.replace(` ${chunk}`, '')

      // Save the mentioned users except the bot
      if (user.equals(client.user)) {
        isMentioned = true
      } else {
        mentionedUsers.push({ user, key: chunk })
      }
    }

    const context = {
      apiKey,
      prefix,
      commands,
      searchIndex,
      site,
      icon,
      limit,
      mentionedUsers,
      isMentioned,
      versions
    }

    if (isMentioned) {
      await commands.help.execute(message, context)
      return
    }

    try {
      if (processCommands(message, context)) {
        count.increment()
      }
    } catch (error) {
      console.error(error)
    }
  })

  await client.login(token)

  return client
}
