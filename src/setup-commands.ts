import { REST } from '@discordjs/rest';
import { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } from './config';
import { Routes } from 'discord-api-types/v9';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Client, Collection } from 'discord.js';
import { Command } from './types';
import { ThreadStore } from './commands/thread';

export default class Commands {
	commands: Collection<String, Command>;
	thread_store: ThreadStore;

	async build(client: Client) {
		this.commands = new Collection();
		this.thread_store = new ThreadStore();
		const __dirname = path.dirname(fileURLToPath(import.meta.url));

		const apiData = [];

		// Retrieve all commands
		const commandsPath = path.join(__dirname, 'commands');
		const commandFiles = fs.readdirSync(commandsPath);

		// Build commands
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = await import(filePath);
			apiData.push(command.default.data.toJSON());
			this.commands.set(command.default.data.name, command.default);
		}

		// Deploy the commands
		const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);
		rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
			body: apiData,
		})
			.then(() => {
				console.log('Commands API updated');
			})
			.catch(console.error);

		// React to the interactions
		client.on('interactionCreate', async (interaction) => {
			if (!interaction.isCommand()) return;

			const command = this.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.run(interaction, this.thread_store);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		});
	}
}
