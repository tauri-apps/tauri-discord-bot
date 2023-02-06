import 'dotenv/config';
import { DEV_MODE, GUILD_ID } from './config';
import { JellyCommands } from 'jellycommands';
import { GatewayIntentBits } from 'discord.js';
import healthcheck from './healthcheck';

const client = new JellyCommands({
    commands: 'src/commands',
    events: 'src/events',

    clientOptions: {
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMessages
        ],
    },

    dev: {
        global: DEV_MODE,

        // If we set dev to true in a command it disabled global and adds it to the guilds bellow
        guilds: [GUILD_ID],
    },

    // we can disable this but I like to see the debug messages xD - GHOST
    debug: true,

    // This should hopefully fix the issues in production
    cache: DEV_MODE,
});

function health() {
    if (!client.isReady())
        return 502
    return 200
}

healthcheck(health);

// Auto reads the DISCORD_TOKEN environment variable
await client.login()
