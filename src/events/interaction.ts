import { event } from 'jellycommands';
import { reopen_thread, solve_thread } from '../utils/threads.js';
import { ButtonInteraction, InteractionUpdateOptions, MessageActionRow, MessageButton, ThreadChannel } from 'discord.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';

export default event({
	name: 'interactionCreate',
	run: async (_, interaction) => {
		// When getting a ButtonInteraction
		if (interaction instanceof ButtonInteraction) {
			const channel = interaction.channel
			// In a Thread channel
			if (channel instanceof ThreadChannel) {
				// A request to solve the thread received
				if (interaction.customId === 'solve') {
					try {
						// Attempt to solve the channel
						await solve_thread(channel)
						// Successfully solved the channel, update the button
						const msg = wrap_in_embed(
							'Thread solved. Thank you everyone! 🥳',
						) as InteractionUpdateOptions
						const row = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('reopen')
									.setLabel('Mark as Unsolved')
									.setStyle('SECONDARY')
									.setEmoji('❔'),
							);
						msg.components = [row]
						await interaction.update(msg)
					} catch (e) {
						// Send the error back to the user
						const reply = await interaction.channel?.send(wrap_in_embed((e as Error).message))
						// Delete the error message after 5 seconds so it doesn't clutter the chat log
						setTimeout(async () => {
							await reply?.delete()
						}, 5000)
					}
				}
				// A request to reopen the thread received
				if (interaction.customId === 'reopen') {
					try {
						// Attempt to reopen the channel
						await reopen_thread(channel)
						// Successfully reopened the channel, update the button
						const msg = wrap_in_embed(
							"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.",
						) as InteractionUpdateOptions
						const row = new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId('solve')
									.setLabel('Mark as Solved')
									.setStyle('PRIMARY')
									.setEmoji('✅'),
							);
						msg.components = [row]
						await interaction.update(msg)
					} catch (e) {
						// Send the error back to the user
						const reply = await interaction.channel?.send(wrap_in_embed((e as Error).message))
						// Delete the error message after 5 seconds so it doesn't clutter the chat log
						setTimeout(async () => {
							await reply?.delete()
						}, 5000)
					}

				}
			}
		}
	},
});
