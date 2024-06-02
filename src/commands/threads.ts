import { command } from 'jellycommands';
import {
    AnyThreadChannel,
    Channel,
    ChannelType,
    ChatInputCommandInteraction,
    Collection,
    GuildTextBasedChannel,
} from 'discord.js';
import { HELP_THREAD_CHANNELS } from '../config';
import { wrapErrors } from '../utils/errors';

export default command({
    name: 'threads',
    description: 'Manage all threads',
    options: [
        {
            name: 'list',
            description: 'List all open threads',
            type: 'Subcommand',
        },
    ],
    global: true,
    defer: { ephemeral: true },
    run: wrapErrors(async (interaction) => {
        const subcommand = interaction.options.getSubcommand(true);

        const activeThreads =
            await interaction.guild.channels.fetchActiveThreads();

        const visibleThreads = activeThreads.threads.filter((thread) =>
            thread
                .permissionsFor(interaction.user)
                .has(['ReadMessageHistory', 'ViewChannel']),
        );

        switch (subcommand) {
            case 'list': {
                await handleList(interaction, visibleThreads);
                break;
            }
        }
    }),
});

// If the channel is a text channel, it doesn't have a parent.
// For other kinds of channels, we return null since it's not a thread.
// If the channel is a thread, we return the parent channel.
function getParentChannel(channel: GuildTextBasedChannel): Channel | null {
    switch (channel.type) {
        case ChannelType.GuildText:
            return channel;

        case ChannelType.PublicThread:
            return channel.parent;

        case ChannelType.PrivateThread:
            return channel.parent;

        default:
            return null;
    }
}

async function handleList(
    interaction: ChatInputCommandInteraction,
    visibleThreads: Collection<string, AnyThreadChannel<boolean>>,
) {
    const parentChannel = getParentChannel(interaction.channel);
    if (!parentChannel) {
        return interaction.followUp({
            ephemeral: true,
            content:
                'You can only use this command in a text channel or thread.',
        });
    }

    const isHelpChannel = HELP_THREAD_CHANNELS.includes(parentChannel.id);

    const threadsWithinChannel = visibleThreads.filter(
        (thread) => thread.parentId === parentChannel.id,
    );

    const threads = isHelpChannel
        ? threadsWithinChannel
        : threadsWithinChannel.filter((thread) => thread.name.startsWith('❔'));

    if (!threads.size) {
        return interaction.followUp({
            ephemeral: true,
            content: `There are no active threads in <#${parentChannel.id}>.`,
        });
    }

    const threadList = threads.map((thread) => `<#${thread.id}>`).join(', ');

    await interaction.followUp({
        content: `Active threads in <#${parentChannel.id}>: ${threadList}`,
    });
}
