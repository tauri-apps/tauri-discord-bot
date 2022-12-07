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
                // The new channel will only have one of the tags, no further action required
                if (newChannel.appliedTags.filter(tag => tag === unsolveTag || tag === solveTag).length === 1) return
                // Detect if this was a Bot interaction by checking the combination of solved/unsolved in the old and new channels
                if (oldChannel.appliedTags.includes(unsolveTag) && oldChannel.appliedTags.includes(solveTag) && (!newChannel.appliedTags.includes(solveTag) || !newChannel.appliedTags.includes(unsolveTag))) return;
                // Tags to apply, without solve or unsolved, maximum 4 entries
                let tags = newChannel.appliedTags.filter(tag => tag !== solveTag && tag !== unsolveTag).splice(0, 4)
                // solved !unsolved > !solved !unsolved : user removed solved, set unsolved
                if ((oldChannel.appliedTags.includes(solveTag) && !oldChannel.appliedTags.includes(unsolveTag)) && (!newChannel.appliedTags.includes(solveTag) && !newChannel.appliedTags.includes(unsolveTag))) {
                    tags.unshift(unsolveTag)
                    // !solved unsolved > !solved !unsolved : user removed unsolved, set solved
                } else if ((oldChannel.appliedTags.includes(unsolveTag) && !oldChannel.appliedTags.includes(solveTag)) && (!newChannel.appliedTags.includes(solveTag) && !newChannel.appliedTags.includes(unsolveTag))) {
                    tags.unshift(solveTag)
                    // solved !unsolved > solved unsolved : user marked already solved as unsolved, set unsolved
                } else if ((oldChannel.appliedTags.includes(solveTag) && !oldChannel.appliedTags.includes(unsolveTag)) && (newChannel.appliedTags.includes(solveTag) && newChannel.appliedTags.includes(unsolveTag))) {
                    tags.unshift(unsolveTag)
                    // !solved unsolved > solved unsolved : user marked already unsolved as solved, set solved
                } else if ((oldChannel.appliedTags.includes(unsolveTag) && !oldChannel.appliedTags.includes(solveTag)) && (newChannel.appliedTags.includes(solveTag) && newChannel.appliedTags.includes(unsolveTag))) {
                    tags.unshift(solveTag)
                    // > unsolved solved : post was going to be marked as both, assume solved is intended
                } else if (newChannel.appliedTags.includes(unsolveTag) && newChannel.appliedTags.includes(solveTag)) {
                    tags.unshift(solveTag)
                    // > !unsolved !unsolved : post was going to be marked as neither, assume unsolved is intended
                } else if (!newChannel.appliedTags.includes(unsolveTag) && !newChannel.appliedTags.includes(solveTag)) {
                    tags.unshift(unsolveTag)
                }
                // If neither tag is going to exist for any reason, add unsolved
                if (!tags.includes(solveTag) && !tags.includes(unsolveTag)) tags.unshift(unsolveTag)
                // Ensure no duplicates are in the array
                tags = [...new Set(tags)].sort()
                // Apply tags if they are different from what's already being applied
                if (tags.toString() !== newChannel.appliedTags.sort().toString()) newChannel.setAppliedTags(tags)
            }
        }
    },
});
