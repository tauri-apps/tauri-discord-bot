import { event } from 'jellycommands';
import { check_autothread_permissions, reopen_thread, solve_thread } from '../utils/threads.js';
import {
	ButtonInteraction,
	InteractionUpdateOptions,
	MessageActionRow,
	MessageButton,
	ModalSubmitInteraction,
	ThreadChannel,
} from 'discord.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';
import { getAssistModal, getModal } from '../modals/index.js';
import { get_member } from '../utils/snowflake.js';

export default event({
	name: 'interactionCreate',
	run: async (_, interaction) => {
		// When getting a ButtonInteraction
		if (interaction instanceof ButtonInteraction) {
			const channel = interaction.channel;
			// In a Thread channel
			if (channel instanceof ThreadChannel) {
				switch (interaction.customId) {
					// A request to solve the thread received
					case 'solve': {
						try {
							// Attempt to solve the channel
							await solve_thread(channel);
							// Successfully solved the channel, update the button
							const msg = wrap_in_embed(
								'Thread solved. Thank you everyone! 🥳',
							) as InteractionUpdateOptions;
							const row = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId('reopen')
									.setLabel('Mark as Unsolved')
									.setStyle('SECONDARY')
									.setEmoji('❔'),
								...interaction.message.components[0].components.filter(val => val.customId !== 'solve')
							);
							msg.components = [row];
							await interaction.update(msg);
						} catch (e) {
							// Send the error back to the user
							await interaction.reply(
								wrap_in_embed((e as Error).message),
							);
							// Delete the error message after 15 seconds so it doesn't clutter the chat log
							setTimeout(async () => {
								await interaction.deleteReply();
							}, 15000);
						}
						break;
					}
					// A request to reopen the thread received
					case 'reopen': {
						try {
							// Attempt to reopen the channel
							await reopen_thread(channel);
							// Successfully reopened the channel, update the button
							const msg = wrap_in_embed(
								"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.",
							) as InteractionUpdateOptions;
							const row = new MessageActionRow().addComponents(
								new MessageButton()
									.setCustomId('solve')
									.setLabel('Mark as Solved')
									.setStyle('PRIMARY')
									.setEmoji('✅'),
								...interaction.message.components[0].components.filter(val => val.customId !== 'reopen')
							);
							msg.components = [row];
							await interaction.update(msg);
						} catch (e) {
							// Send the error back to the user
							await interaction.reply(
								wrap_in_embed((e as Error).message),
							);
							// Delete the error message after 15 seconds so it doesn't clutter the chat log
							setTimeout(async () => {
								await interaction.deleteReply();
							}, 15000);
						}
						break;
					}
					// A request for automated assistance
					case 'auto_assist': {
						try {
							// Find the member of the interaction user
							const member = await get_member(interaction);
							// Couldn't find the users member
							if (!member) throw Error('Unable to find you')
							// Check if the member has the proper permissions to interact with the bot	
							const has_permission = await check_autothread_permissions(
								channel,
								member,
							);
							// Check if it has permissions
							if (!has_permission)
								throw Error(
									"You don't have the permissions to manage this thread",
								);
							// Show the modal to the user
							await interaction.showModal(getAssistModal('start').modal);
						} catch (e) {
							// Send the error back to the user
							await interaction.reply(
								wrap_in_embed((e as Error).message)
							);
							// Delete the error message after 15 seconds so it doesn't clutter the chat log
							setTimeout(async () => {
								await interaction.deleteReply();
							}, 15000);
						}
						break;
					}
				}
				// If the interaction id starts with auto_assist-
				if (interaction.customId.startsWith('auto_assist-')) {
					try {
						// Find the member of the interaction user
						const member = await get_member(interaction);
						// Couldn't find the users member
						if (!member) throw Error('Unable to find you')
						// Check if the member has the proper permissions to interact with the bot
						const has_permission = await check_autothread_permissions(
							channel,
							member,
						);
						// Check if it has permissions
						if (!has_permission)
							throw Error(
								"You don't have the permissions to manage this thread",
							);
						// Get the desired modal, e.g. auto_assist-start
						const modal = getModal(interaction.customId.split('-').slice(0, 2).join('-'))
						// Get the desired action, e.g. yes
						const option = interaction.customId.split('-').slice(2).join('-')
						// Run the action attached to the modal
						await modal.options[option](interaction)
					} catch (e) {
						// Send the error back to the user
						await interaction.reply(
							wrap_in_embed((e as Error).message),
						);
						// Delete the error message after 15 seconds so it doesn't clutter the chat log
						setTimeout(async () => {
							await interaction.deleteReply();
						}, 15000);
					}
				}
			}
		}
		// If the interaction is a ModalSubmissionInteraction
		if (interaction instanceof ModalSubmitInteraction) {
			// And starts with auto_assist-
			if (interaction.customId.startsWith('auto_assist-')) {
				try {
					// Get the appropriate modal and run its handler
					await getModal(interaction.customId).run(interaction)
				} catch (e) {
					// Send the error back to the user
					await interaction.reply(
						wrap_in_embed((e as Error).message),
					);
					// Delete the error message after 15 seconds so it doesn't clutter the chat log
					setTimeout(async () => {
						await interaction.deleteReply();
					}, 15000);
				}
			}
		}
	},
});
