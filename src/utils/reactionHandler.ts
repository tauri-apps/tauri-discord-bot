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
            "\nEveryone on this server must follow the rules outlined in our [Code of Conduct](<https://github.com/tauri-apps/tauri/blob/dev/.github/CODE_OF_CONDUCT.md>) and Discord's [Community Guidelines](<https://discord.com/guidelines/>)!",
        );
        messageArray.push(
            'Please also read the descriptions and posting guidelines in each channel.',
        );
        messageArray.push(
            '\nAny kind of "Job hunting" and "Job offer" posts are strictly forbidden on this server! Due to fighting Scam and Bots we have to be very quick to mute or ban offenders. Please ping @mods if you see messages we missed.',
        );
        // TODO: Fix the wording and uncomment
        // messageArray.push('\nDue to the nature of Discord servers we are forced to ban users more liberally than explained in these documents, but you are welcome to send ban appeals to the contact channels listed in our Code of Conduct if you believe that we made a mistake.',);
        messageArray.push(
            '\n**Our rules may be updated at any time so we expect you to regularly check this channel for changes.**',
        );

        messageArray.push('\nServer Overview:');
        messageArray.push('\n**<#616186924390023173>**');
        messageArray.push(
            "- Meet other Tauri developers or get help if you're stuck.",
        );
        messageArray.push(
            '  - Talk about topics related to Tauri in <#731495028677148753>.',
        );
        messageArray.push('  - Ask for help in <#1047150269156294677>!');
        messageArray.push(
            '  - Show off your projects in <#1047149172144492604>.',
        );
        messageArray.push(
            '  - Talk about anything not related to Tauri in <#618328921330417692>.',
        );

        messageArray.push('\n**<#879007560429088800>**');
        messageArray.push(
            '- Get involved with Tauri development and browse the different projects. This category of channels is **not** a place to ask for help with your apps.',
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
            messages
                .filter((item) => item.author.id == item.client.user.id)
                .forEach((item) => item.delete());
            console.debug('Attempting to send message...');
            // Send the message
            message = await channel.send(messageBody);
            console.debug('Message sent');
        }
    } catch (error) {
        console.error(`Issue starting up reaction: ${error}`);
    }
}
