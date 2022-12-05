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
            // Tags to apply
            let tags = [...message.channel.appliedTags]
            // Marked as both solved and unsolved
            if (tags.includes(solveTag) && tags.includes(unsolveTag)) {
                // Remove the unsolve tag
                tags = tags.filter(tag => tag !== unsolveTag)
            }
            else if (tags.includes(solveTag) || tags.includes(unsolveTag)) {
                // Do nothing if it has one of the tags
            }
            else {
                // Not marked as either, add unsolved tag
                tags.push(unsolveTag)
            }
            // Ensure no duplicates are in the array
            tags = [...new Set(tags)]
            // Apply tags
            if (tags !== message.channel.appliedTags) message.channel.setAppliedTags(tags)
        }
    },
});
