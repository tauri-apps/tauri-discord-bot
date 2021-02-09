const Discord = require('discord.js')

module.exports = {
  name: 'help',
  aliases: ['h'],
  async execute (message, context) {
    const { commands } = context

    const embed = new Discord.RichEmbed()
      .setColor('#ffffff')
      .setAuthor('Help', `${context.icon}`)
      .setDescription(
        '\nCommands:' +
        `\n• ${getCommandInfo(context.prefix, commands.help)}` +
        `\n• ${getCommandInfo(context.prefix, commands.search)}` +
        '\n' +
        '\nExamples:' +
        `\n• \`${context.prefix}${commands.help.name}\` [shows this data in a DM]` +
        `\n• \`${context.prefix}${commands.search.name} -dm {search criteria}\` [shows the search results in a DM]` +
        `\n• \`${context.prefix}${commands.search.name} {search criteria}\` [shows the search results in current channel]` +
        `\n• \`${context.prefix}${commands.search.name} {search criteria} @user1 [...@user2]\` [shows the search results to specified user(s) in a DM]` +
        '\n')
      .setTimestamp()
      .setFooter('API Latency is ' + `${Date.now() - message.createdTimestamp}` + ' ms • Created/Maintained by Jeff Galbraith', message.author.displayAvatarURL)

    await message.author.send({
      embed: embed
    })
  }
}

const getCommandInfo = (prefix, command) => {
  return `${prefix}${[command.name, ...command.aliases].join(` or ${prefix}`)}`
}
