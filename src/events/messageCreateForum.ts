import { ThreadChannel, ChannelType, ForumChannel } from 'discord.js';
import { event } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers';
import {
    SOLVABLE_FORUMS,
    UNSOLVED_TAG,
    SOLVED_TAG,
    MESSAGE_READ,
    SUPPORT_FORUM,
    JOBS_FORUM,
} from '../config';

export default event({
    name: 'messageCreate',
    run: async ({}, message) => {
        // Rules for whether or not the message should be dealt with by the bot
        const should_ignore =
            message.author.bot ||
            !(message.channel.type === ChannelType.PublicThread);
        // If the message should be ignored, return without further processing
        if (should_ignore) return;
        // If this is posted in a solvable forum channel
        if (
            message.channel instanceof ThreadChannel &&
            SOLVABLE_FORUMS.includes(message.channel.parentId)
        ) {
            // Parent forum channel
            const solveChannel = message.guild.channels.cache.get(
                message.channel.parentId,
            ) as ForumChannel;
            // Solve tag
            const solveTag = solveChannel.availableTags.find(
                (tag) => tag.name === SOLVED_TAG,
            ).id;
            // Unsolve tag
            const unsolveTag = solveChannel.availableTags.find(
                (tag) => tag.name === UNSOLVED_TAG,
            ).id;
            // The channel will have one of the tags, no further action required
            if (
                message.channel.appliedTags.filter(
                    (tag) => tag === unsolveTag || tag === solveTag,
                ).length === 1
            )
                return;
            // Tags to apply, without solve or unsolved, maximum 4 entries
            let tags = message.channel.appliedTags
                .filter((tag) => tag !== solveTag && tag !== unsolveTag)
                .splice(0, 4);
            // Marked as both solved and unsolved
            if (
                message.channel.appliedTags.includes(solveTag) &&
                message.channel.appliedTags.includes(unsolveTag)
            ) {
                // Add the solved tag
                tags.unshift(solveTag);
            }
            // If neither tag is going to exist in the channel, add unsolved
            if (!tags.includes(solveTag) && !tags.includes(unsolveTag))
                tags.unshift(unsolveTag);
            // Ensure no duplicates are in the array
            tags = [...new Set(tags)].sort();
            // Apply tags
            if (
                tags.toString() !==
                message.channel.appliedTags.sort().toString()
            )
                message.channel.setAppliedTags(tags);
            // If this is a new post and not just a regular message
            // Disabled for now due to the fact that nobody reads the message
            if (!message.nonce && message.position === 0 && false) {
                const msg = await message.channel.send(
                    wrap_in_embed(
                        `Thank you for your message!

                    1. Search the <#${SUPPORT_FORUM}> forum for existing posts
                    2. Search Github issues to see if this is a known issue
                    3. Send the output of \`tauri info\`
                    4. Provide reproduction steps for your issue
                    5. Be polite and remember to follow the [Tauri Code of Conduct](https://github.com/tauri-apps/governance-and-guidance/blob/main/CODE_OF_CONDUCT.md)

                    Once you've read this and taken the appropriate steps, react to this message`,
                    ),
                );
                await msg.react(MESSAGE_READ);
            }
        } else if (
            message.channel instanceof ThreadChannel &&
            JOBS_FORUM === message.channel.parentId
        ) {
            try {
                const allJobPosts = await message.channel.messages.fetch();
                const userMessages = allJobPosts
                    .filter((msg) => msg.author.id === message.author.id)
                    .filter((msg) => msg.id !== message.id);
                // bulkDelete only works for messages younger than 2 weeks.
                userMessages.forEach((item) => item.delete());
            } catch (err) {
                console.error('Error handling post in Jobs forum.', err);
            }
        }
    },
});
