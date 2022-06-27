import { DISCORD_TOKEN } from './config';
import { Client, Intents } from 'discord.js';
import './health-check';
import Commands from './setup-commands';
import Events from './setup-events';

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});

const commands = new Commands();
const events = new Events();

await commands.build(client);
await events.build(client);

client.once('ready', () => {
	console.log('Bot ready!');
});

client.login(DISCORD_TOKEN);
