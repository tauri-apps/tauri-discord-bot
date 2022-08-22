import { event } from 'jellycommands';
import { reopen_thread, solve_thread } from '../utils/threads.js';
import {
    ButtonInteraction,
    GuildMember,
    InteractionUpdateOptions,
    ActionRowBuilder,
    ButtonBuilder,
    ThreadChannel,
    ButtonStyle,
} from 'discord.js';
import { wrap_in_embed } from '../utils/embed_helpers.js';

export default event({
    name: 'interactionCreate',
    run: async (_, interaction) => {
        // When getting a ButtonInteraction
        if (interaction instanceof ButtonInteraction) {
            const channel = interaction.channel;
            // In a Thread channel
            if (channel instanceof ThreadChannel) {
                // A request to solve the thread received
                if (interaction.customId === 'solve') {
                    try {
                        // Attempt to solve the channel
                        await solve_thread(
                            channel,
                            interaction.member as GuildMember,
                        );
                        // Successfully solved the channel, update the button
                        const msg = wrap_in_embed(
                            'Thread solved. Thank you everyone! 🥳',
                        ) as InteractionUpdateOptions;
                        const row =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('reopen')
                                    .setLabel('Mark as Unsolved')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji('❔'),
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
                }
                // A request to reopen the thread received
                if (interaction.customId === 'reopen') {
                    try {
                        // Attempt to reopen the channel
                        await reopen_thread(channel);
                        // Successfully reopened the channel, update the button
                        const msg = wrap_in_embed(
                            "I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it.",
                        ) as InteractionUpdateOptions;
                        const row =
                            new ActionRowBuilder<ButtonBuilder>().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('solve')
                                    .setLabel('Mark as Solved')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('✅'),
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
                }
            }
        }
    },
});
