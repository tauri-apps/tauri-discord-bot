import { command } from 'jellycommands';
import { HELP_THREAD_CHANNELS } from '../config';
import { wrap_in_embed } from '../utils/embed_helpers';
import { reopen_thread } from '../utils/threads.js';
import {
	Message,
	MessageActionRow,
	MessageButton,
	MessageEditOptions,
} from 'discord.js';

export default command({
	name: 'threads',
	description: 'Manage all threads',

	options: [
		{
			name: 'list',
			description: 'List all open threads',
			type: 'SUB_COMMAND',
			options: [
				{
					name: 'filter',
					description: 'List open threads',
					type: 'STRING',
					choices: [
						{
							name: 'Active',
							value: 'active',
						},
						{
							name: 'Chats',
							value: 'chats',
						},
						{
							name: 'Unsolved issues',
							value: 'unsolved_issues',
						},
					],
				},
			],
		},
	],

	global: true,
	defer: {
		ephemeral: false,
	},

	run: async ({ interaction }) => {
		try {
			const subcommand = interaction.options.getSubcommand(true);
			// Don't respond to the command wherever it was ran
			await interaction.deleteReply();
			// Get all active non-private threads in the guild that the user has access to
			const threads = (
				await interaction.guild.channels.fetchActiveThreads()
			).threads
				.map((x) => x)
				.filter(
					(thread) =>
						!thread.isPrivate() &&
						thread
							.permissionsFor(interaction.user)
							.has(['READ_MESSAGE_HISTORY', 'VIEW_CHANNEL']),
				);

			switch (subcommand) {
				case 'list':
					{
						let message = '';
						// 'active', 'chats', 'unsolved_issues'
						const filter = interaction.options.get('filter')
							? interaction.options.get('filter').value
							: 'active';
						switch (filter) {
							case 'active': {
								// Set a title for the DM
								message =
									"**Here's a list of all currently active threads**\n";
								// Add all threads to the message
								message += threads
									.map((thread) => `<#${thread.id}>`)
									.join('\n');
								break;
							}
							case 'chats': {
								// Set a title for the DM
								message =
									"**Here's a list of all currently active chats**\n";
								// Add all chat threads to the message
								message += threads
									.filter(
										(val) =>
											!val.name.startsWith('✅') &&
											!val.name.startsWith('❔'),
									)
									.map((thread) => `<#${thread.id}>`)
									.join('\n');
								break;
							}
							case 'unsolved_issues': {
								// Set a title for the DM
								message =
									"**Here's a list of all currently active unsolved issues**\n";
								// Add all unsolved issue threads to the message
								message += threads
									.filter((val) => val.name.startsWith('❔'))
									.map((thread) => `<#${thread.id}>`)
									.join('\n');
								break;
							}
						}
						// Send the message to the user
						await interaction.user.send(wrap_in_embed(message));
						break;
					}
					// Check if this is a help channel
					if (!HELP_THREAD_CHANNELS.includes(thread.parentId)) {
						throw new Error("Can't reopen a non-help channel");
					}
					// Attempt to reopen the thread
					await reopen_thread(thread);
					// Successfully reopened the thread
					// Get the start message of the thread
					const start_message = await thread.fetchStarterMessage();
					// Get the first 2 messages after the start message
					const messages = await thread.messages.fetch({
						limit: 2,
						after: start_message.id,
					});
					// Filter to get the bot message with the button
					const bot_message = messages
						.filter((m) => m.components.length > 0)
						.first() as Message;
					// Change the message
					const msg = wrap_in_embed(
						"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.",
					) as MessageEditOptions;
					// Change the button
					const row = new MessageActionRow().addComponents(
						new MessageButton()
							.setCustomId('solve')
							.setLabel('Mark as Solved')
							.setStyle('PRIMARY')
							.setEmoji('✅'),
					);
					msg.components = [row];
					await bot_message.edit(msg);
					// Commands require a reply
					await interaction.followUp(
						wrap_in_embed('Thread reopened.'),
					);
					// Delete the reply after 10 seconds
					setTimeout(async () => {
						await interaction.deleteReply();
					}, 10000);
					break;
			}
		} catch (e) {
			// Send the error
			const reply = (await interaction.followUp(
				wrap_in_embed((e as Error).message),
			)) as Message;
			// Delete the error after 15 seconds
			try {
				setTimeout(async () => {
					reply.delete();
				}, 15000);
			} catch (e) {
				console.error(e);
			}
		}
	},
});
