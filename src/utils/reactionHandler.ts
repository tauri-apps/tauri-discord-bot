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
            "Talk with other Tauri developers in <#731495028677148753>, ask for help in <#1047150269156294677>, or show off what you've created with Tauri in <#1047149172144492604>.",
        );
        messageArray.push('\n**<#879007560429088800>**');
        messageArray.push(
            "Get involved with Tauri development and browse the different projects.",
        );

        let messageBody = messageArray.join('\n');

        console.debug('Getting messages...');

        const messages = await channel.messages.fetch({ limit: 10 });

        console.debug('Got messages');

        // Get an existing message with identical contents
        let message = messages
            .filter((item) => item.content === messageBody)
            .last();

        if (message && message.author.id == message.client.user.id) {
            console.debug('Attempting to edit message...');
            // Edit the message
            await message.edit(messageBody);
            console.debug('Message edited');
        } else {
            // Delete old messages from the bot
            messages.filter((item) => item.author.id == item.client.user.id).forEach((item) => item.delete())
            console.debug('Attempting to send message...');
            // Send the message
            message = await channel.send(messageBody);
            console.debug('Message sent');
        }
    } catch (error) {
        console.error(`Issue starting up reaction: ${error}`);
    }
}
