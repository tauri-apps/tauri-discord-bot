import { event } from 'jellycommands';
import { REACTION_ROLE_CHANNEL } from '../config';
import { hasPermission } from '../utils/reactionHandler';

export default event({
    name: 'messageReactionRemove',
    run: async (_, reaction, user) => {
        try {
            // The bot shouldn't react to its own reactions
            if (user.bot)
                return
            // If this is a reaction in the role reaction channel
            if (reaction.message.channelId === REACTION_ROLE_CHANNEL) {
                const result = await hasPermission(reaction, user);
                result.member.roles.remove(result.roleId);
            }
        } catch (error) {
            console.error(`Issue in messageReactionRemove: ${error}`);
        }
    },
});
