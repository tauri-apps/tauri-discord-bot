import {
	Client,
	GuildMember,
	GuildTextBasedChannel,
	MessageReaction,
	PartialMessageReaction,
	PartialUser,
	User,
} from 'discord.js';
import { REACTION_ROLE, REACTION_ROLE_CHANNEL } from '../config';
import { wrap_in_embed } from './embed_helpers';

export async function hasPermission(
	reaction: MessageReaction | PartialMessageReaction,
	user: User | PartialUser,
): Promise<{ member: GuildMember; roleId: string }> {
	try {
		// Check if bot
		if (user.bot) {
			return Promise.reject('Was a bot');
		}

		// Check if in a guild
		if (!reaction.message.guild) {
			return Promise.reject('Not performed in a guild');
		}

		// Check if in a monitored channel
		if (reaction.message.channelId != REACTION_ROLE_CHANNEL) {
			return Promise.reject('Not performed in a monitored channel');
		}

		// Check if a monitored reaction
		const role = REACTION_ROLE.filter(
			(value) =>
				value.reactionId == reaction.emoji.id ||
				value.reactionId == reaction.emoji.name,
		)[0];

		if (!role) {
			return Promise.reject('Not a monitored reaction');
		}

		const roleId = role.roleId;

		// Get the person who reacted
		const member = await reaction.message.guild.members.fetch(user.id);

		if (!member) {
			return Promise.reject("Member couldn't be found");
		}

		return { member, roleId };
	} catch (error) {
		console.error(`Issue in reaction: ${error}`);
	}
}

export async function sendStartupMessage(client: Client) {
	try {
		const channel = client.channels.cache.get(
			REACTION_ROLE_CHANNEL,
		) as GuildTextBasedChannel;

		var message = await (await channel.messages.fetch({ limit: 1 })).last();

		var messageBody =
			'Welcome to the server!\nReact below to claim the role you want\n';

		if (message && message.author.id == message.client.user.id) {
			// Make a new message
			await message.edit(messageBody);
		} else {
			message = await channel.send(messageBody);
		}

		var roleDescription = '';

		REACTION_ROLE.forEach((reaction) => {
			message.react(reaction.reactionId);
			roleDescription = roleDescription.concat(
				`\n${reaction.reactionId} ${reaction.description}`,
			);
		});

		message.edit(wrap_in_embed(roleDescription));
	} catch (error) {
		console.error(`Issue starting up reaction: ${error}`);
	}
}
