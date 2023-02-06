import { TextChannel, ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import { updateCache } from '../utils/cacheManagement';
import { sendReactionRoleMessage } from '../utils/reactionHandler';

export default event({
    name: 'ready',
    run: async (_, client) => {
        console.log(client.user.tag, 'is online!');
        // Send the message for role reactions
        sendReactionRoleMessage(client);
        // Update the cache so that the bot can properly react to messages sent before it went live
        updateCache(client)
        // Run a task in the background every 60 minutes
        setInterval(async () => {
            // Update the cache so that old messages can be reacted to
            updateCache(client)
        }, 60_000 * 60) // Every 60 minutes
    },
});