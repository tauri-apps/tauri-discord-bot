import {
    Client,
    DiscordAPIError,
    ForumChannel,
    TextChannel,
    ThreadChannel,
} from 'discord.js';

export async function updateCache(client: Client) {
    // Iterate through channels in the cache
    client.channels.cache.forEach(async (channel) => {
        try {
            // If it's a ForumChannel
            if (channel instanceof ForumChannel) {
                // Fetch all its threads
                const threads = await channel.threads.fetch();
                // Iterate the threads
                threads.threads.forEach(async (thread) => {
                    // Ensure it's really a ThreadChannel, partially to satisfy TypeScript
                    if (thread instanceof ThreadChannel && !thread.archived) {
                        // Fetch the threads messages to the cache
                        thread.messages.fetch({ limit: 100 });
                    }
                });
            }
            // If it's a TextChannel
            if (channel instanceof TextChannel) {
                // Fetch all messages to the cache
                await channel.messages.fetch({ limit: 100 });
            }
        } catch (e) {
            // Error 50001 is just Missing Access, which we can ignore since it just means the bot
            // doesn't have access to the channel, e.g moderators-only
            if ((e as DiscordAPIError).code !== 50001) {
                // Output all other errors
                console.error(e);
            }
        }
    });
    // Outputs before the cache is actually updated, but it's close enough
    console.log('Message cache updated');
}
