import { ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import { MESSAGE_READ, REACTION_ROLE_CHANNEL, SOLVABLE_FORUMS } from '../config'
import { hasPermission } from '../utils/reactionHandler';

export default event({
    name: 'messageReactionAdd',
    run: async (_, reaction, user) => {
        try {
            // The bot shouldn't react to its own reactions
            if (user.bot || SOLVABLE_FORUMS.includes(reaction.message.channelId))
                return
            // If this is a reaction in the role reaction channel
            if (reaction.message.channelId === REACTION_ROLE_CHANNEL) {
                const result = await hasPermission(reaction, user);
                result.member.roles.add(result.roleId);
            } else {
                // Otherwise we make a more general guess that if the original message was from the bot
                // and it's a MESSAGE_READ emoji reaction, we assume the message should be deleted
                if (reaction.message.author.bot && reaction.emoji.name === MESSAGE_READ) {
                    reaction.message.delete()
                }
            }
        } catch (error) {
            // Couldn't get it to raise the unwanted error in the test server, so instead of
            // checking for an error code we'll just filter out any errors that include this text
            if (!`${error}`.includes('Not performed in a monitored channel'))
                console.error(`Issue in messageReactionAdd: ${error}`);
        }
    },
});
