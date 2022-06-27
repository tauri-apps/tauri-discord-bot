import {
	SlashCommandBuilder,
	SlashCommandStringOption,
	SlashCommandSubcommandBuilder,
} from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../types';

// TODO: Make sure it checks if the person has permission
// TODO: Check if in an "auto thread" channel

async function check_permission(
	memberId: String,
	channelId: String,
): Promise<boolean> {
	// TODO
	return true;
}

function throttle(channelId: String, store: ThreadStore): boolean {
	const date = store.checkStore(channelId);
	if (!date) {
		store.addToStore(channelId);
		return false;
	}

	const tenMinutesAgo = new Date(Date.now() - 1000 * 60 * 10);

	if (date < tenMinutesAgo) {
		return false;
	} else {
		return true;
	}
}

export class ThreadStore {
	store: Map<String, Date>;
	constructor() {
		this.store = new Map();
	}

	addToStore(channelId: String) {
		this.store.set(channelId, new Date());
	}

	checkStore(channelId: String): Date | undefined {
		return this.store.get(channelId);
	}
}

const command: Command = {
	data: new SlashCommandBuilder()
		.setName('thread')
		.setDescription('Manage a thread')
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('archive')
				.setDescription('Archive a thread'),
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('rename')
				.setDescription('Rename a thread')
				.addStringOption(
					new SlashCommandStringOption()
						.setName('name')
						.setDescription('The new name of the thread')
						.setRequired(true),
				),
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('solve')
				.setDescription('Mark a thread as solved'),
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName('reopen')
				.setDescription('Reopen a solved thread'),
		),

	async run(interaction: CommandInteraction, store: ThreadStore) {
		const subcommand = interaction.options.getSubcommand(true);
		const channel = await interaction.channel?.fetch();

		if (!channel?.isThread()) {
			return await interaction.reply({
				content: 'You can only use this command within a thread',
				ephemeral: true,
			});
		}

		const member = await interaction.guild?.members.fetch(
			interaction.user.id,
		);

		if (!member) {
			return await interaction.reply({
				content: "That's strange, I couldn't find you in this guild",
				ephemeral: true,
			});
		}

		const has_permission = await check_permission(
			interaction.user.id,
			channel.id,
		);

		if (!has_permission) {
			return await interaction.reply({
				content: "You don't have permission to manage this thread",
				ephemeral: true,
			});
		}

		switch (subcommand) {
			case 'archive': {
				await interaction.deferReply({ ephemeral: true });
				await channel
					.setArchived(true)
					.then(() => {
						interaction.followUp('Thread archived');
					})
					.catch((error) => {
						interaction.followUp(
							'An issue ocurred while archiving the thread',
						);
						console.log(error);
					});

				break;
			}
			case 'rename': {
				if (throttle(interaction.channelId, store)) {
					interaction.reply({
						content:
							'You can only rename a thread once every 10 minutes',
						ephemeral: true,
					});
					break;
				}

				const new_name = interaction.options.getString('name', true);

				await interaction.deferReply({
					ephemeral: true,
				});

				channel
					.setName(new_name)
					.then(() => {
						interaction.followUp('Thread renamed');
					})
					.catch((error) => {
						interaction.followUp("Thread couldn't be renamed");
						console.log(error);
					});

				break;
			}
			case 'solve': {
				const name = interaction.channel.name;

				if (name.startsWith('✅')) {
					interaction.followUp('Thread is already solved');
				}

				const new_name = '✅ ' + name.replaceAll('❔', '').trim();

				await interaction.deferReply({
					ephemeral: true,
				});

				interaction.channel
					.setName(new_name)
					.then(() => {
						interaction.followUp('Solved');
					})
					.catch((error) => {
						interaction.followUp("Couldn't mark as solved");
						console.log(error);
					});

				break;
			}
			case 'reopen': {
				if (throttle(interaction.channelId, store)) {
					interaction.reply({
						content:
							'You have to wait 10 minutes after renaming a thread to reopen it',
						ephemeral: true,
					});
					break;
				}

				const name = interaction.channel.name;

				if (name.startsWith('❔')) {
					interaction.followUp('Thread is already open');
				}

				const new_name = '❔ ' + name.replaceAll('✅', '').trim();

				await interaction.deferReply({
					ephemeral: true,
				});

				interaction.channel
					.setName(new_name)
					.then(() => {
						interaction.followUp('Reopened');
					})
					.catch((error) => {
						interaction.followUp("Couldn't reopen thread");
						console.log(error);
					});
				break;
			}
		}
	},
};

export default command;
