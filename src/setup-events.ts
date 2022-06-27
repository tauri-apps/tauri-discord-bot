import { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } from './config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client, Collection, Message, MessageReaction, User } from 'discord.js';
import { Command } from './types';
import CreateThread from './events/create-thread';
import Reaction from './events/reaction';

export default class Commands {
	commands: Collection<String, Command>;

	async build(client: Client) {
		CreateThread(client);
		Reaction(client);
	}
}
