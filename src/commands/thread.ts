import { command } from 'jellycommands';
import { SOLVED_TAG, UNSOLVED_TAG } from '../config.ts';
import { wrap_in_embed } from '../utils/embed_helpers.ts';
import { get_member } from '../utils/snowflake.ts';
import { check_autothread_permissions } from '../utils/threads.ts';
import { Message, ForumChannel } from 'discord.js';

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
                case 'solve': {
                    if (!(thread.parent instanceof ForumChannel))
                        throw new Error("Can't solve a non-forum thread");
                    // Parent forum channel
                    const solveChannel = thread.guild.channels.cache.get(
                        thread.parentId!!,
                    ) as ForumChannel;
                    // Solve tag
                    const solveTag = solveChannel.availableTags.find(
                        (tag) => tag.name === SOLVED_TAG,
                    )!!.id;
                    // Unsolve tag
                    const unsolveTag = solveChannel.availableTags.find(
                        (tag) => tag.name === UNSOLVED_TAG,
                    )!!.id;
                    // If this is a ThreadChannel
                    let tags = thread.appliedTags
                        .filter((tag) => tag !== solveTag && tag !== unsolveTag)
                        .splice(0, 4);
                    // Add the solved tag
                    tags.unshift(solveTag);
                    // If neither tag is going to exist in the channel, add unsolved
                    if (!tags.includes(solveTag) && !tags.includes(unsolveTag))
                        tags.unshift(unsolveTag);
                    // Ensure no duplicates are in the array
                    tags = [...new Set(tags)].sort();
                    // Apply tags
                    if (
                        tags.toString() !== thread.appliedTags.sort().toString()
                    )
                        thread.setAppliedTags(tags);
                    // Commands require a reply
                    await interaction.followUp(wrap_in_embed('Thread solved.'));
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
