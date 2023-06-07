import {
    ActionRowBuilder,
    ButtonBuilder,
    ThreadChannel,
    TextChannel,
    MessageType,
    ChannelType,
    ButtonStyle,
} from 'discord.js';
import { event } from 'jellycommands';
import { AUTO_THREAD_CHANNELS, HELP_THREAD_CHANNELS } from '../config';
import { wrap_in_embed } from '../utils/embed_helpers';
import { add_thread_prefix } from '../utils/threads';

export default event({
    name: 'messageCreate',
    run: async ({ }, message) => {
        // Rules for whether or not the message should be dealt with by the bot
        const should_ignore =
            message.author.bot ||
            message.channel.type != ChannelType.GuildText ||
            message.type != MessageType.Default ||
            !AUTO_THREAD_CHANNELS.includes(message.channelId);

        // If a response is sent by a user in an auto thread channel
        if (
            message.type === MessageType.Reply &&
            AUTO_THREAD_CHANNELS.includes(message.channelId) &&
            !message.author.bot
        ) {
            // Delete their message
            await message.delete();
            // Get the channel as a TextChannel
            const channel = message.channel as TextChannel;
            // Get the thread that the message refers to
            let thread = channel.threads.cache.get(
                message.reference.messageId,
            ) as ThreadChannel;
            // If the thread wasn't found in the cache
            if (!thread) {
                // Get all active threads in the guild
                const threads = (
                    await message.guild.channels.fetchActiveThreads(true)
                ).threads;
                // Get the thread
                thread = threads.get(
                    message.reference.messageId,
                ) as ThreadChannel;
            }
            // Make msg available outside the if/else scope
            let msg;
            // Base message text to send to the user
            const baseMessage = HELP_THREAD_CHANNELS.includes(message.channelId)
                ? 'Thanks for helping out! Please send you reply in the thread created for the issue and not directly in the channel.'
                : 'Please send you reply in the thread created for the topic and not directly in the channel.';
            // If the thread was found
            if (thread) {
                // Replicate the users message
                const forwardMessage = {
                    content:
                        `> Reply by <@${message.author.id}>:\n` +
                        message.content,
                    files: message.attachments.map((x) => x),
                };
                // Send the message to the thread
                await thread.send(forwardMessage);
                // Create response message to the user with a link to the thread
                msg = wrap_in_embed(
                    `${baseMessage}\n\nClick this link to go directly to the thread:\n<#${thread.id}>`,
                );
            } else {
                // Create response message to the user
                msg = wrap_in_embed(baseMessage);
            }
            // Send a DM to the user with the response message
            await message.author.send(msg);
        }
        // If the message should be ignored, return without further processing
        if (should_ignore) return;
        // Remove bloat from links and replace colons with semicolons
        const raw_name = message.content
            .replaceAll('http://', '')
            .replaceAll('https://', '')
            .replaceAll(':', ';')
            .replace(/\n+/g, ' ');
        const name = HELP_THREAD_CHANNELS.includes(message.channelId)
            ? add_thread_prefix(raw_name, false)
            : raw_name;
        const thread = await message.channel.threads.create({
            name: name.length > 100 ? name.slice(0, 97) + '...' : name,
            startMessage: message,
        });
        if (HELP_THREAD_CHANNELS.includes(message.channelId)) {
            send_instruction_message(thread);
        }
    },
});

async function send_instruction_message(thread: ThreadChannel) {
    const base_description =
        "I've created a thread for your message. Please continue any discussion in this thread. You can rename it with the `/thread rename` command if I didn't set a proper name for it.";

    const description = HELP_THREAD_CHANNELS.includes(thread.parentId!)
        ? `${base_description}\n\nWhen your problem is solved close the thread with the \`/thread solve\` command.`
        : base_description;

    // Add the solve button to the message
    const msg = wrap_in_embed(description) as any;
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('solve')
            .setLabel('Mark as Solved')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✅'),
    );
    msg.components = [row];

    return await thread.send(msg);
}
