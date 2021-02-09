const Discord = require('discord.js')
const client = new Discord.Client()

const processCommands = require('./process_commands.js')
const commands = require('./commands')
const count = require('./count')

// get .env data
const token = process.env.DISCORD_BOT_SECRET
const prefix = process.env.PREFIX
const site = process.env.SITE
const icon = process.env.ICON
const limit = process.env.LIMIT

require('./keep_alive.js')

client.on('ready', () => {
  console.log(`[Bot is online | Node: ${process.version} | Discord.js: ${Discord.version}]\nConnected as: ${client.user.username} (ID: ${client.user.id})\nServers Connected: ${client.guilds.size}`)
  client.user.setActivity(`${prefix}${commands.search.aliases[0]} {search terms}`, { type: 'LISTENING' })
})

client.on('message', async message => {
  if (message.author.bot) return
  if (message.content.startsWith(prefix) !== true) return

  // find mentions
  const users = []
  const split = message.content.split(/ +/)
  for (let i = 1; i < split.length; ++i) {
    const user = getUserFromMention(split[i])
    if (user) {
      users.push({ user, key: split[i] })
    }
  }
  users.forEach(user => {
    // strip mentions
    message.content = message.content.replace(` ${user.key}`, '')
  })

  try {
    if (processCommands(message, {
      prefix,
      commands,
      site,
      icon,
      limit,
      users
    })) {
      count.increment()
    }
  } catch (error) {
    console.error(error)
  }
})

function getUserFromMention (mention) {
  if (!mention) return

  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1)

    if (mention.startsWith('!')) {
      mention = mention.slice(1)
    }

    return client.users.get(mention)
  }
}

client.login(token)
