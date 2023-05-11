import { command } from 'jellycommands';
import { HELP_THREAD_CHANNELS, SOLVED_TAG, UNSOLVED_TAG } from '../config';
import { wrap_in_embed } from '../utils/embed_helpers';
import { get_member } from '../utils/snowflake';
import {
    check_autothread_permissions,
    rename_thread,
    solve_thread,
    rename_limit,
    reopen_thread,
} from '../utils/threads.js';
import { no_op } from '../utils/promise.js';
import {
    GuildMember,
    Message,
    ActionRowBuilder,
    ButtonBuilder,
    MessageEditOptions,
    ButtonStyle,
    ForumChannel,
} from 'discord.js';

export default command({
    name: 'thread',
    description: 'Manage a thread',

    options: [
        {
            name: 'archive',
            description: 'Archive a thread',
            type: 'Subcommand',
        },
        {
            name: 'rename',
            description: 'Rename a thread',
            type: 'Subcommand',
            options: [
                {
                    name: 'name',
                    description: 'The new name of the thread',
                    type: 'String',
                    required: true,
                },
            ],
        },
        {
            name: 'reopen',
            description: 'Reopen a solved thread',
            type: 'Subcommand',
        },
        {
            name: 'solve',
            description: 'Mark a thread as solved',
            type: 'Subcommand',
        },
    ],

    global: true,
    defer: {
        ephemeral: false,
    },

    run: async ({ interaction }) => {
        try {
            const subcommand = interaction.options.getSubcommand(true);
            const thread = await interaction.channel?.fetch();

            if (!thread?.isThread())
                throw new Error('This channel is not a thread');

            const member = await get_member(interaction);

            if (!member) throw new Error('Unable to find you');

            const has_permission = await check_autothread_permissions(
                thread,
                member,
            );

            if (!has_permission)
                throw new Error(
                    "You don't have the permissions to manage this thread",
                );

            switch (subcommand) {
                case 'archive': {
                    await thread.setArchived(true).catch(no_op);
                    // Follow up the interaction
                    await interaction.followUp(
                        wrap_in_embed('Thread archived'),
                    );
                    // Delete the reply after 10 seconds
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000);
                    break;
                }

                case 'rename': {
                    // Get the new name from the interaction options, remove bloat from links and replace colons with semicolons
                    const new_name = interaction.options
                        .getString('name', true)
                        .replaceAll('http://', '')
                        .replaceAll('https://', '')
                        .replaceAll(':', ';')
                        .replace(/\n+/g, ' ');
                    const parent_id = thread.parentId || '';

                    // Make sure the new name isn't the same as the old one so rename calls aren't wasted
                    if (new_name === thread.name.slice(2))
                        throw new Error(
                            'The requested name was the same as the current name',
                        );
                    // Check if the command has reached the rename limit
                    if (rename_limit.is_limited(thread.id, true))
                        throw new Error(
                            'You can only rename a thread once every 10 minutes',
                        );
                    // Rename the thread
                    await rename_thread(
                        thread,
                        new_name,
                        HELP_THREAD_CHANNELS.includes(parent_id),
                    );
                    // Follow up the interaction
                    await interaction.followUp(wrap_in_embed('Thread renamed'));
                    // Delete the reply after 10 seconds
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000);
                    break;
                }

                case 'solve': {
                    // Check if this is a help channel
                    if (HELP_THREAD_CHANNELS.includes(thread.parentId)) {
                        // Attempt to solve the thread
                        await solve_thread(
                            thread,
                            interaction.member as GuildMember,
                        );
                        // Successfully solved the thread
                        // Get the first message in the thread
                        const start_message = await thread.fetchStarterMessage();
                        // Get the first 2 messages after the start message
                        const messages = await thread.messages.fetch({
                            limit: 2,
                            after: start_message.id,
                        });
                        // Filter the messages to find the bot message with the buttons
                        const bot_message = messages
                            .filter((m) => m.components.length > 0)
                            .first() as Message;
                        // Change the message
                        const msg = wrap_in_embed(
                            'Thread solved. Thank you everyone! 🥳',
                        ) as MessageEditOptions;
                        // Change the button
                        const row =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('reopen')
                                    .setLabel('Mark as Unsolved')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji('❔'),
                            );
                        msg.components = [row];
                        await bot_message.edit(msg);
                        // Commands require a reply
                        await interaction.followUp(wrap_in_embed('Thread solved.'));
                        // Delete the reply after 10 seconds
                        setTimeout(async () => {
                            await interaction.deleteReply();
                        }, 10000);
                    }
                    // Not a help channel, check if its parent is a ForumChannel
                    if (!(thread.parent instanceof ForumChannel))
                        throw new Error("Can't solve a non-help channel");
                    // Parent forum channel
                    const solveChannel = thread.guild.channels.cache.get(thread.parentId) as ForumChannel
                    // Solve tag
                    const solveTag = solveChannel.availableTags.find(tag => tag.name === SOLVED_TAG).id
                    // Unsolve tag
                    const unsolveTag = solveChannel.availableTags.find(tag => tag.name === UNSOLVED_TAG).id
                    // If this is a ThreadChannel
                    let tags = thread.appliedTags.filter(tag => tag !== solveTag && tag !== unsolveTag).splice(0, 4)
                    // Add the solved tag
                    tags.unshift(solveTag)
                    // If neither tag is going to exist in the channel, add unsolved
                    if (!tags.includes(solveTag) && !tags.includes(unsolveTag)) tags.unshift(unsolveTag)
                    // Ensure no duplicates are in the array
                    tags = [...new Set(tags)].sort()
                    // Apply tags
                    if (tags.toString() !== thread.appliedTags.sort().toString()) thread.setAppliedTags(tags)
                    // Commands require a reply
                    await interaction.followUp(wrap_in_embed('Thread solved.'));
                    // Delete the reply after 10 seconds
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000);
                    break;
                }

                case 'reopen': {
                    // Check if this is a help channel
                    if (!HELP_THREAD_CHANNELS.includes(thread.parentId)) {
                        throw new Error("Can't reopen a non-help channel");
                    }
                    // Attempt to reopen the thread
                    await reopen_thread(thread);
                    // Successfully reopened the thread
                    // Get the start message of the thread
                    const start_message = await thread.fetchStarterMessage();
                    // Get the first 2 messages after the start message
                    const messages = await thread.messages.fetch({
                        limit: 2,
                        after: start_message.id,
                    });
                    // Filter to get the bot message with the button
                    const bot_message = messages
                        .filter((m) => m.components.length > 0)
                        .first() as Message;
                    // Change the message
                    const msg = wrap_in_embed(
                        "I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.",
                    ) as MessageEditOptions;
                    // Change the button
                    const row =
                        new ActionRowBuilder<ButtonBuilder>().addComponents(
                            new ButtonBuilder()
                                .setCustomId('solve')
                                .setLabel('Mark as Solved')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('✅'),
                        );
                    msg.components = [row];
                    await bot_message.edit(msg);
                    // Commands require a reply
                    await interaction.followUp(
                        wrap_in_embed('Thread reopened.'),
                    );
                    // Delete the reply after 10 seconds
                    setTimeout(async () => {
                        await interaction.deleteReply();
                    }, 10000);
                    break;
                }
            }
        } catch (e) {
            // Send the error
            const reply = (await interaction.followUp(
                wrap_in_embed((e as Error).message),
            )) as Message;
            // Delete the error after 15 seconds
            try {
                setTimeout(async () => {
                    reply.delete();
                }, 15000);
            } catch (e) {
                console.error(e);
            }
        }
    },
});
