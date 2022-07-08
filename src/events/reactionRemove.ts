import { Client, GuildTextBasedChannel } from 'discord.js';
import { event } from 'jellycommands';
import { REACTION_ROLE, REACTION_ROLE_CHANNEL } from '../config';
import { hasPermission } from '../utils/reactionHandler';

export default event({
	name: 'messageReactionRemove',
	run: async (_, reaction, user) => {
		try {
			const result = await hasPermission(reaction, user);

			result.member.roles.remove(result.roleId);
		} catch (error) {
			console.error(`Issue in reaction: ${error}`);
		}
	},
});

export async function sendMessage(client: Client) {
	try {
		const channel = client.channels.cache.get(
			REACTION_ROLE_CHANNEL,
		) as GuildTextBasedChannel;

		const message = await channel.send('Choose your reaction to continue');
		for (const [key, value] of Object.entries(REACTION_ROLE)) {
			message.react(key);
		}
	} catch (error) {
		console.error(`Issue starting up reaction: ${error}`);
	}
}
