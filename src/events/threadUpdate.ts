import {
    ThreadChannel,
    ChannelType,
    ForumChannel,
} from 'discord.js';
import { event } from 'jellycommands';
import { SOLVABLE_FORUMS, UNSOLVED_TAG, SOLVED_TAG } from '../config';

export default event({
    name: 'threadUpdate',
    run: async ({ }, oldChannel, newChannel) => {
        if (newChannel instanceof ThreadChannel) {
            // If newChannel is a solvable channel
            if (SOLVABLE_FORUMS.includes(newChannel.parentId)) {
                // Parent forum channel
                const solveChannel = newChannel.guild.channels.cache.get(newChannel.parentId) as ForumChannel
                // Solve tag
                const solveTag = solveChannel.availableTags.find(tag => tag.name === SOLVED_TAG).id
                // Unsolve tag
                const unsolveTag = solveChannel.availableTags.find(tag => tag.name === UNSOLVED_TAG).id
                // Detect if this was a Bot interaction by checking the combination of solved/unsolved in the old and new channels
                if (oldChannel.appliedTags.includes(unsolveTag) && oldChannel.appliedTags.includes(solveTag) && (!newChannel.appliedTags.includes(solveTag) || !newChannel.appliedTags.includes(unsolveTag))) return;
                // Tags to apply
                let tags = [...newChannel.appliedTags]
                // Marked as both solved and unsolved
                if (oldChannel.appliedTags.includes(solveTag) && (tags.includes(solveTag) && tags.includes(unsolveTag))) {
                    // Remove the unsolve tag
                    tags = tags.filter(tag => tag !== solveTag)
                } else if (oldChannel.appliedTags.includes(unsolveTag) && (tags.includes(solveTag) && tags.includes(unsolveTag))) {
                    // Remove the unsolve tag
                    tags = tags.filter(tag => tag !== unsolveTag)
                }
                // If neither tag is going to exist in newChannel, add unsolved
                if (!tags.includes(solveTag) && !tags.includes(unsolveTag)) tags.push(unsolveTag)
                // Ensure no duplicates are in the array
                tags = [...new Set(tags)]
                // Apply tags
                if (tags !== newChannel.appliedTags) newChannel.setAppliedTags(tags)
            }
        }
    },
});
