const Discord = require('discord.js')

const getEmbeddedMessage = (message, context, title = '') => {
  const embed = new Discord.MessageEmbed()
    .setColor('#ffffff')
    .setAuthor(title, `${context.icon}`)
    .setTimestamp()
    .setFooter('API Latency is ' + `${Date.now() - message.createdTimestamp}` + ' ms • Created/Maintained by Jeff Galbraith', message.author.displayAvatarURL)

  return embed
}

/**
 * Gets distinct name of a user
 *
 * @param {Discord.User} user
 * @param {Discord.GuildMember} member Pass this for also including the display name
 *
 * @returns {string} distinct name of the user in form of 'UserName#1234' or 'DisplayName (UserName#1234)'
 */
const getDistinctUsername = (user, member = null) => {
  const distinctName = `${user.username}#${user.discriminator}`
  const withDisplayName = member !== null
  const displayName = withDisplayName ? member.displayName : ''

  return withDisplayName ? `${displayName} (${distinctName})` : distinctName
}

const USER_MENTION_REGEX = /^<@!?(\d+)>$/

/**
 * Gets user from a mention string
 *
 * @param {Discord.Client} client
 * @param {string} mention
 *
 * @returns {string} distinct name of the user in form of 'UserName#1234' or 'DisplayName (UserName#1234)'
 */
const getUserFromMention = (client, mention) => {
  const matches = mention.match(USER_MENTION_REGEX)
  if (!matches) return

  const [, id] = matches

  return client.users.cache.get(id)
}

const getDonationText = () => {
  return '\n_Support Tauri development by [Donating](https://opencollective.com/tauri/)_\n'
}

module.exports = {
  getEmbeddedMessage,
  getDistinctUsername,
  getUserFromMention,
  getDonationText
}
