const Discord = require('discord.js')
const googleIt = require('google-it')

module.exports = {
  name: 'search',
  aliases: ['s'],
  async execute (message, context, parts) {
    if (parts.length === 0) {
      nothingToSearch(message, context)
      return
    }

    let dm = false

    // check for commands: may be more added later
    if (parts[0].startsWith('-')) {
      // check if this is a DM message
      if (parts[0] === '-dm') {
        dm = true
        // remove command
        parts = parts.slice(1)
      }
    }

    if (context.users.length > 0) {
      // automatic dm
      dm = true
    }

    // check once again for search criteria
    if (dm === true && parts.length === 0) {
      nothingToSearch(message, context)
      return
    }

    // build the query
    const args = parts.join(' ')
    const query = context.site + ' ' + args

    await message.react('🔍')

    const response = []
    try {
      const results = await googleIt({ query: query, limit: context.limit })

      if (results.length > 0) {
        results.forEach(element => {
          response.push(`[${decodeURIComponent(decodeURIComponent(element.title))}](${decodeURIComponent(decodeURIComponent(element.link))})\n${decodeURIComponent(decodeURIComponent(element.snippet))}\n`)
        })
      } else {
        response.push('**No results found!** Try again...')
      }

      if (response.length > 0) {
        const embed = new Discord.RichEmbed()
          .setColor('#ffffff')
          .setAuthor(`Results for "${args}"`, `${context.icon}`)
          .setDescription(`\n${response.join('\n')}`)
          .setTimestamp()
          .setFooter('API Latency is ' + `${Date.now() - message.createdTimestamp}` + ' ms • Created/Maintained by Jeff Galbraith', message.author.displayAvatarURL)

        if (dm === true) {
          if (context.users.length > 0) {
            context.users.forEach(user => {
              user.user.send({
                embed: embed
              })
              message.reply(`Results have been sent via Direct Message to ${user.key}`)
            })
          } else {
            await message.author.send({
              embed: embed
            })
          }
        } else {
          await message.channel.send({
            embed: embed
          })
        }
      }
    } catch (err) {
      try {
        await message.channel.send({
          embed: {
            color: 0xff2727,
            description: `:warning: **${message.author.username}**, ${err}`,
            footer: {
              text: 'API Latency is ' + `${Date.now() - message.createdTimestamp}` + ' ms • Created/Maintained by Jeff Galbraith'
            }
          }
        })
      } catch (e) {
        console.error('Couldn\'t even send the error message to the user', e, err)
      }
    }
  }
}

async function nothingToSearch (message, context) {
  const reply = `:warning: You must give me something to search for... {\`${context.prefix}${context.commands.search.name} input ...\`}`
  await message.reply(reply)
}
