const Discord = require('discord.js')
const moment = require('moment')
const { version } = require('../package.json')
const count = require('../count')

module.exports = {
  name: 'stats',
  aliases: [],
  async execute (message, context, parts) {
    const embed = new Discord.RichEmbed()
      .setColor('#ffffff')
      .setAuthor('Statistics', `${context.icon}`)
      .setDescription(`Stats for **${message.guild.name}** Discord server from **${message.client.user.username}** bot`)
      .addField('Uptime', `${moment(new Date() - message.client.uptime).toNow('d[ days], h[ hours], m[ minutes, and ]s[ seconds]')}`)
      .addField('Memory', `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`)
      .addField('Users', `${message.client.guilds.map(guild => guild.memberCount).reduce((a, b) => a + b)}`)
      .addField('Version', `v${version}`)
      .addField('Searches', `${count.getCount()}`)
      .setTimestamp()
      .setFooter('API Latency is ' + `${Date.now() - message.createdTimestamp}` + ' ms • Created/Maintained by Jeff Galbraith', message.author.displayAvatarURL)

    await message.channel.send({
      embed: embed
    })
  }
}
