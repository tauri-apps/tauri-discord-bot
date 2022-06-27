import { DEV_MODE } from '../config';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
	data: new SlashCommandBuilder()
		// TODO: Disable during prod
		.setName('ping')
		.setDescription('Shall we play a game?'),

	async run(interaction: CommandInteraction) {
		await interaction.reply({ content: 'Pong! 🏓', ephemeral: true });
	},
};

export default command;
