import { command } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers';
import { InteractionReplyOptions, Message } from 'discord.js';

export default command({
    name: 'when',
    description: 'Ask when features will arrive',

    options: [
        {
            name: 'mobile',
            description: 'What is the status of mobile support?',
            type: 'Subcommand',
        },
        {
            name: 'version2',
            description: 'When will version 2 be released?',
            type: 'Subcommand',
        },
    ],

    global: true,
    defer: {
        ephemeral: true,
    },

    run: async ({ interaction }) => {
        try {
            const subcommand = interaction.options.getSubcommand(true);

            switch (subcommand) {
                case 'mobile': {
                    // Change the message
                    const msg = wrap_in_embed(
                        `**90% developed, 90% to go**
                        Mobile support is still in its alpha stages, and is not yet ready for production use.
                        API's may change, things may break and documentation is sparse.`,
                    ) as InteractionReplyOptions;
                    // Commands require a reply
                    await interaction.followUp(msg);
                    break;
                }
                case 'version2': {
                    let current = 90;
                    // Change the message
                    const msg = wrap_in_embed(
                        `**Soon™**
                        Version 2 is still in its alpha stages, and is not yet ready for production use.
                        We are hoping to release the beta this year and maybe have a stable release in 2024.
                        We will however push up its release as long as is necessary to guarantee a smooth experience and a stable product.`,
                    ) as InteractionReplyOptions;
                    // Commands require a reply
                    await interaction.followUp(msg);
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
});
