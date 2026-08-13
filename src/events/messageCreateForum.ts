import {
    ThreadChannel,
    ChannelType,
    ForumChannel,
    type AnyThreadChannel,
} from 'discord.js';
import { event } from 'jellycommands';
import {
    SOLVABLE_FORUMS,
    UNSOLVED_TAG,
    SOLVED_TAG,
    JOBS_FORUM,
} from '../config.ts';

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
            message.channel.parentId &&
            SOLVABLE_FORUMS.includes(message.channel.parentId)
        ) {
            // Parent forum channel
            const solveChannel = message.guild!!.channels.cache.get(
                message.channel.parentId,
            ) as ForumChannel;
            // Solve tag
            const solveTag = solveChannel.availableTags.find(
                (tag) => tag.name === SOLVED_TAG,
            )!!.id;
            // Unsolve tag
            const unsolveTag = solveChannel.availableTags.find(
                (tag) => tag.name === UNSOLVED_TAG,
            )!!.id;
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
        } else if (
            message.channel instanceof ThreadChannel &&
            JOBS_FORUM === message.channel.parentId &&
            !message.member?.roles.cache.some(
                (role) => role.name === 'working-group',
            )
        ) {
            console.log('Handling new post in Jobs channel');
            try {
                let allJobPosts = [];

                const threadCacheA =
                    await message.channel.parent!!.threads.fetchActive(false);
                allJobPosts = [...threadCacheA.threads.values()];

                let hasMore = true;
                let before;

                while (hasMore) {
                    const threadCacheB =
                        await message.channel.parent!!.threads.fetchArchived(
                            {
                                fetchAll: true,
                                limit: 100,
                                before,
                            },
                            false,
                        );
                    hasMore = threadCacheB.hasMore;
                    before = threadCacheB.threads.last();
                    allJobPosts = [
                        ...allJobPosts,
                        ...threadCacheB.threads.values(),
                    ];
                }

                console.log(`Fetched ${allJobPosts.length} threads`);

                const userThreads = allJobPosts
                    .filter((thread) => thread.ownerId === message.author.id)
                    .filter((thread) => thread.id !== message.id);
                // bulkDelete only works for messages younger than 2 weeks.
                console.log(
                    `Deleting ${userThreads.length} threads of same author`,
                );
                userThreads.forEach(deleteThread);

                const oldThreads = allJobPosts
                    .filter(
                        (thread) =>
                            thread.createdTimestamp!! + 15778800000 <
                            Date.now(),
                    )
                    .filter((thread) => thread.ownerId !== message.author.id)
                    .filter((thread) => thread.archived);
                console.log(
                    `Deleting ${oldThreads.length} old archived threads`,
                );
                oldThreads.forEach(async (thread) => {
                    if (
                        ['1115981718336311296', '1348662651848228924'].includes(
                            thread.id,
                        )
                    ) {
                        console.log('skipping guarded thread');
                        return;
                    }
                    deleteThread(thread);
                });
            } catch (err) {
                console.error('Error handling post in Jobs forum.', err);
            }
        }
    },
});

function deleteThread(thread: AnyThreadChannel) {
    thread
        .delete()
        .then(() => {
            console.log(`Thread ${thread.id} "${thread.name}" deleted`);
        })
        .catch((err) =>
            console.error(
                `Error deleting thread ${thread.id} "${thread.name}": ${err}`,
            ),
        );
}
