const moment = require('moment')

const count = require('../count')
const { getEmbeddedMessage } = require('../utils')

module.exports = {
  name: 'stats',
  aliases: [],
  desc: 'Displays server stats',
  examples: ['Show server stats'],
  async execute (message, context, parts) {
    if (message.channel.type === 'dm') {
      const reply = ':warning: Unable to process command while in DM session.'
      message.reply(reply)
      return
    }

    // console.log(message)
    console.log('Member count:', message.guild.memberCount)
    const embed = getEmbeddedMessage(message, context, 'Statistics')
      .setDescription(`Stats for **${message.guild.name}** Discord server from **${message.client.user.username}** bot`)
      .addField('Uptime', `${moment(new Date() - message.client.uptime).toNow('d[ days], h[ hours], m[ minutes, and ]s[ seconds]')}`)
      .addField('Memory', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)
      // .addField('Users', `${message.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}`)
      .addField('Users', `${message.guild.memberCount}`)
      .addField('Version', `v${context.versions.self}`)
      .addField('Searches', `${count.getCount()}`)

    await message.channel.send({
      embed: embed
    })
  }
}
