import { event } from 'jellycommands';
import { REACTION_ROLE, REACTION_ROLE_CHANNEL } from '../config';

export default event({
	name: 'messageReactionAdd' || 'messageReactionRemove',
	run: async (_, reaction, user) => {
		// Check if in a guild
		if (!reaction.message.guild) {
			console.debug('Not performed in a guild');
			return;
		}

		// Check if in a monitored channel
		if (reaction.message.channelId != REACTION_ROLE_CHANNEL) {
			console.debug('Not performed in a monitored channel');
			return;
		}

		console.log(reaction.emoji);

		var roleId;

		// Check if a monitored reaction
		if (REACTION_ROLE.hasOwnProperty(reaction.emoji.id)) {
			roleId = REACTION_ROLE[reaction.emoji.id];
		} else if (REACTION_ROLE.hasOwnProperty(reaction.emoji.name)) {
			roleId = REACTION_ROLE[reaction.emoji.name];
		} else {
			console.debug('Not a monitored reaction');
			return;
		}

		// Get the person who reacted
		const member = await reaction.message.guild.members.fetch(user.id);

		if (!member) {
			console.debug("Member couldn't be found");
			return;
		}

		console.log(reaction.client);

		// Need a way to tell if it was sent by 'messageReactionAdd' or 'messageReactionRemove'

		// member.roles.remove(roleId);
		// member.roles.add(roleId);
	},
});
