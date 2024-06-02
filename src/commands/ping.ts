import { APIRole, Role, roleMention } from 'discord.js';
import { command } from 'jellycommands';

export default command({
    name: 'ping',
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
        // Fetch the role and make sure it's pingable.
        const role = interaction.options.getRole('role', true);

        // Fetch the member, since the interaction member might not be fully resolved.
        const member = await interaction.guild.members.fetch(
            interaction.user.id,
        );

        // Check if the role is pingable or the member has permission to ping everyone anyways.
        let pingable = member.permissions.has('MentionEveryone', true)
            ? 'yes'
            : pingableStatus(role);

        if (pingable === 'no') {
            return await interaction.reply({
                content: 'This role is not pingable.',
                ephemeral: true,
            });
        }

        // The user has to have the role to ping it in some circumstances.
        if (pingable === 'self') {
            if (!member.roles.cache.has(role.id)) {
                return await interaction.reply({
                    content: 'You do not have permission to ping this role.',
                    ephemeral: true,
                });
            }
        }

        // Ping the role in a reply so that you can see the original sender of the command.
        await interaction.reply(`${roleMention(role.id)}`);
    },
});

function pingableStatus(role: Role | APIRole): 'yes' | 'no' | 'self' {
    if (role.name === 'working-group' || role.name.startsWith('wg-')) {
        return 'self';
    } else if (['mod', 'moderator'].includes(role.name)) {
        return 'yes';
    } else {
        return 'no';
    }
}
