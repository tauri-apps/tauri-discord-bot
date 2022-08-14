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
			return Promise.reject('Bot performed the action');
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
				value.emojiId == reaction.emoji.id ||
				value.emojiId == reaction.emoji.name,
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

export async function sendReactionRoleMessage(client: Client) {
	try {
		const channel = client.channels.cache.get(
			REACTION_ROLE_CHANNEL,
		) as GuildTextBasedChannel;

		var messageArray = ['**Welcome to the Tauri community!**'];
		messageArray.push(
			'\nTauri is a toolkit to build an optimized, secure, and frontend-independent application for multi-platform deployment.',
		);
		messageArray.push(
			'\nFamiliarize yourself with our Code of Conduct: <https://github.com/tauri-apps/tauri/blob/dev/.github/CODE_OF_CONDUCT.md>',
		);

		messageArray.push('\n**<#616186924390023173>**');
		messageArray.push(
			"Talk with other Tauri developers in <#731495028677148753>, ask for help in <#625037620996734986>, or show off what you've created with Tauri in <#616234029842300930>.",
		);
		messageArray.push('\n**<#879007560429088800>**');
		messageArray.push(
			"If you'd like to get involved with Tauri development you can react to the Tauri Contributor role below to be able to chat in the various channels.",
		);
		messageArray.push('\n**<#683637724116418561>**');
		messageArray.push(
			"See what the community is working on outside of Tauri. Reach out if you have a passion project you'd like to talk about.",
		);
		messageArray.push('\n**Server Roles**');
		messageArray.push('React below to receive the relative role');

		let messageBody = messageArray.join('\n');

		console.debug('Getting messages...');

		const messages = await channel.messages.fetch({ limit: 10 });

		console.debug('Got messages');

		let message = messages
			.filter((item) => item.content === messageBody)
			.last();

		if (message && message.author.id == message.client.user.id) {
			console.debug('Attempting to edit message...');
			await message.edit(messageBody);
			console.debug('Message edited');
		} else {
			console.debug('Attempting to send message...');
			message = await channel.send(messageBody);
			console.debug('Message sent');
		}

		// Loop all available reaction roles
		REACTION_ROLE.forEach(async (role) => {
			// Get the reaction
			console.debug('Attempting to get reactions...');
			const reaction = await message.reactions.resolve(role.emojiId);
			console.debug('Got reactions');

			// No reactions yet
			if (!reaction) {
				return;
			}

            // Get all users that reacted minus the bot
            console.debug('Getting users who reacted...');
            const reactedUsers = (await reaction.users.fetch())
                .filter((user) => user.id !== message.author.id);
                // .filter((user) => !!channel.guild.members.fetch(user.id));
            console.debug('Finished fetching users');

            // Loop all users and add the role
            reactedUsers.forEach(async (user) => {
                try {
                    const result = await hasPermission(reaction, user);
                    console.debug('Attempting to add role...');
                    await result.member.roles.add(result.roleId);
                    console.debug('Role added');
                } catch (error) {
                    console.error(`Issue adding role: ${error}`);
                }
            });
        });

		var roleDescription: string[] = [];

		REACTION_ROLE.forEach(async (reaction) => {
			message.react(reaction.emojiId);
			roleDescription.push(
				`<:${reaction.emojiName}:${reaction.emojiId}> ${reaction.description}`,
			);
		});

		await message.edit(wrap_in_embed(roleDescription.join('\n')));
	} catch (error) {
		console.error(`Issue starting up reaction: ${error}`);
	}
}
