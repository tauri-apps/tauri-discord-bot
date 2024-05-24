import { ChatInputCommandInteraction } from 'discord.js';

export function wrapErrors(
    handler: (interaction: ChatInputCommandInteraction) => Promise<void>,
): (args: { interaction: ChatInputCommandInteraction }) => Promise<void> {
    return async ({ interaction }) => {
        try {
            await handler(interaction);
        } catch (error) {
            console.error(error);

            await interaction.editReply({
                content: `Runtime error: ${error}`,
            });
        }
    };
}
