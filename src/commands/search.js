/*
  This file will search Google at site for information
  and return it to user.
*/
const googleIt = require('google-it')

const { getEmbeddedMessage, getDistinctUsername, getDonationText } = require('../utils')

module.exports = {
  name: 'search',
  aliases: ['s'],
  desc: 'Searches Tauri docs',
  examples: [
    '`{search criteria}` [shows the search results in current channel]',
    '`-dm {search criteria}` [shows the search results in a DM]',
    '`{search criteria} @user1 [...@user2]` [shows the search results to specified user(s) in a DM]'
  ],
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

    if (context.mentionedUsers.length > 0) {
      // automatic dm
      dm = true
    }

    // check once again for search criteria
    if (parts.length === 0) {
      nothingToSearch(message, context)
      return
    }

    await message.react('🔍')

    // build the query
    const args = parts.join(' ')
    const query = context.site + ' ' + args

    try {
      const results = await googleIt({ query: query, limit: context.limit })
      let output = ''

      if (results.length === 0) {
        output = '\n**No results found!** Try again...'
      } else {
        results.forEach(element => {
          output += `\n[${element.title}](${element.link})\n${element.snippet}\n`
        })
      }

      output += getDonationText()

      let title = `Results for "${args}"`

      // Display the requester in guild context
      if (message.member) {
        // For tracing back the user in case he/she changes his/her display name or removes the message
        const distinctName = getDistinctUsername(message.author, message.member)

        title += `; requested by ${distinctName}`
      }

      const embed = getEmbeddedMessage(message, context, title)
        .setDescription(output)

      if (dm === false) {
        await message.channel.send({ embed })
        return
      }

      // If no one is mentioned, send to the author
      if (context.mentionedUsers.length <= 0) {
        await message.author.send({ embed })
        await message.react('📨')
        return
      }

      context.mentionedUsers.forEach(mentionedUser => {
        mentionedUser.user.send({ embed })
        message.reply(`Results have been sent via Direct Message to ${mentionedUser.key}`)
      })
    } catch (err) {
      try {
        const embed = getEmbeddedMessage(message, context)
          .setColor('#ff2727')
          .setDescription(`:warning: **${message.author.username}**, ${err}`)

        await message.channel.send({ embed })
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
