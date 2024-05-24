import { command } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers';
import { GuildMemberRoleManager } from 'discord.js';

export default command({
    name: 'reping',
    description: 'Ping a role',

    global: true,

    options: [
        {
            name: 'role',
            description: 'The role you want to ping',
            type: 'Role',
            required: true,
        },
    ],

    run: async ({ interaction }) => {
        // Find the desired role
        const role = interaction.options.getRole('role', true);
        // Check if the user has the role
        let hasRole = (
            interaction.member.roles as GuildMemberRoleManager
        ).cache.find((val) => val.id === role.id);
        // Exit if the user doesn't have the role
        if (!hasRole) return;
        // Send the ping message
        interaction.channel.send(`<@&${role.id}>`);
        // Follow up the interaction
        await interaction.reply(wrap_in_embed('Role pinged'));
        // Delete the reply after 3 seconds
        setTimeout(async () => {
            await interaction.deleteReply();
        }, 3000);
    },
});
