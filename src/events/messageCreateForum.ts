import {
    ThreadChannel,
    ChannelType,
    ForumChannel,
} from 'discord.js';
import { event } from 'jellycommands';
import { SOLVABLE_FORUMS, UNSOLVED_TAG, SOLVED_TAG } from '../config';

export default event({
    name: 'messageCreate',
    run: async ({ }, message) => {
        // Rules for whether or not the message should be dealt with by the bot
        const should_ignore = message.author.bot || !(message.channel.type === ChannelType.PublicThread)
        // If the message should be ignored, return without further processing
        if (should_ignore) return;
        // If this is posted in a solvable forum channel
        if (message.channel instanceof ThreadChannel && SOLVABLE_FORUMS.includes(message.channel.parentId)) {
            // Parent forum channel
            const solveChannel = message.guild.channels.cache.get(message.channel.parentId) as ForumChannel
            // Solve tag
            const solveTag = solveChannel.availableTags.find(tag => tag.name === SOLVED_TAG).id
            // Unsolve tag
            const unsolveTag = solveChannel.availableTags.find(tag => tag.name === UNSOLVED_TAG).id
            // The channel will have one of the tags, no further action required
            if (message.channel.appliedTags.filter(tag => tag === unsolveTag || tag === solveTag).length === 1) return
            // Tags to apply, without solve or unsolved, maximum 4 entries
            let tags = message.channel.appliedTags.filter(tag => tag !== solveTag && tag !== unsolveTag).splice(0, 4)
            // Marked as both solved and unsolved
            if (message.channel.appliedTags.includes(solveTag) && message.channel.appliedTags.includes(unsolveTag)) {
                // Add the solved tag
                tags.unshift(solveTag)
            }
            // If neither tag is going to exist in the channel, add unsolved
            if (!tags.includes(solveTag) && !tags.includes(unsolveTag)) tags.unshift(unsolveTag)
            // Ensure no duplicates are in the array
            tags = [...new Set(tags)].sort()
            // Apply tags
            if (tags.toString() !== message.channel.appliedTags.sort().toString()) message.channel.setAppliedTags(tags)
        }
    },
});
