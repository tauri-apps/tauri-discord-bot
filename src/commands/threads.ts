import { command } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers';
import { Message } from 'discord.js';

export default command({
	name: 'threads',
	description: 'Manage all threads',

	options: [
		{
			name: 'list',
			description: 'List all open threads',
			type: 'SUB_COMMAND',
		},
	],

	global: true,
	defer: {
		ephemeral: true,
	},

	run: async ({ interaction }) => {
		try {
			const subcommand = interaction.options.getSubcommand(true);
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

<<<<<<< HEAD
            switch (subcommand) {
                case 'list': {
                    // Get the parent channel if we're using it inside a thread
                    const parentChannel =
                        interaction.channel.type === 'GUILD_TEXT'
                            ? interaction.channel
                            : interaction.channel.parent;
                    // Filter all threads based on the channel the command was ran in
                    const listThreads = threads
                        .filter(
                            (thread) => thread.parentId === parentChannel.id,
                        )
                        .map((thread) => `<#${thread.id}>`);
                    // Set a title for the DM
                    let message = `**Here's a list of all currently active threads in <#${parentChannel.id}>**\n`;
                    if (listThreads.length === 0) {
                        message = `**There are currently no active threads in <#${parentChannel.id}>**`;
                    } else {
                        // Add all chat threads to the message
                        message += threads
                            .filter(
                                (thread) =>
                                    thread.parentId === parentChannel.id,
                            )
                            .map((thread) => `<#${thread.id}>`)
                            .join('\n');
                    }
                    // Send the message to the user
                    await interaction.followUp(wrap_in_embed(message));
                    break;
                }
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
=======
			switch (subcommand) {
				case 'list': {
					// Get the parent channel if we're using it inside a thread
					const parentChannel =
						interaction.channel.type === 'GUILD_TEXT'
							? interaction.channel
							: interaction.channel.parent;
					// Filter all threads based on the channel the command was ran in
					const listThreads = threads
						.filter(
							(thread) => thread.parentId === parentChannel.id,
						)
						.map((thread) => `<#${thread.id}>`);
					// Set a title for the DM
					let message = `**Here's a list of all currently active threads in <#${parentChannel.id}>**\n`;
					if (listThreads.length === 0) {
						message = `**There are currently no active threads in <#${parentChannel.id}>**`;
					} else {
						// Add all chat threads to the message
						message += threads
							.filter(
								(thread) =>
									thread.parentId === parentChannel.id,
							)
							.map((thread) => `<#${thread.id}>`)
							.join('\n');
					}
					// Send the message to the user
					await interaction.followUp(wrap_in_embed(message));
					break;
				}
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
>>>>>>> 6b8b168 (Revert "Feat/fix threads list")
});
