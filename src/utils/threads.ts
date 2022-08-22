import {
    GuildMember,
    InteractionReplyOptions,
    ActionRowBuilder,
    ButtonBuilder,
    Snowflake,
    ThreadChannel,
    ButtonStyle,
} from 'discord.js';
import {
    DEV_MODE,
    HELPER_ROLES,
    HELP_THREAD_CHANNELS,
    THREAD_ADMIN_IDS,
} from '../config';
import { build_embed } from './embed_helpers';
import { no_op, undefined_on_error } from './promise';
import { has_any_role_or_id } from './snowflake';
import { RateLimitStore } from './ratelimit';

/**
 * Discord allows 2 renames every 10 minutes. We need one always available
 * for the solve command, so only one rename per 10 minutes is allowed for users.
 */
export const rename_limit = new RateLimitStore(1, 10 * 60 * 1000);

/*
 * This is mostly just to prevent abuse. We could reuse the rename limit but
 * highly unlikely it'll be legitimately closed and then reopened multiple
 * times in the same day.
 */
export const reopen_limit = new RateLimitStore(1, 1440 * 60 * 1000);

export const add_thread_prefix = (name: string, solved: boolean) => {
    const prefix = `${solved ? '✅' : '❔'} `;

    return `${prefix}${name.replace(/^[✅❔] /, '')}`;
};

export async function rename_thread(
    thread: ThreadChannel,
    new_name: string,
    use_prefix: boolean = true,
) {
    const prefixed = add_thread_prefix(new_name, thread.name.startsWith('✅'));
    await thread.setName((use_prefix ? prefixed : new_name).slice(0, 100));
}

export async function solve_thread(thread: ThreadChannel, member: GuildMember) {
    if (!(await check_autothread_permissions(thread, member))) {
        throw new Error("You don't have the permissions to manage this thread");
    }
    // Make sure the thread isn't already solved
    if (thread.name.startsWith('✅'))
        throw new Error('Thread already marked as solved');
    // Make sure the thread is located in the AUTO_THREAD_CHANNELS
    if (!HELP_THREAD_CHANNELS.includes(thread.parentId || ''))
        throw new Error('This command only works in a help thread');
    // Make sure the channel hasn't reached it rename limit
    if (rename_limit.is_limited(thread.id, true))
        throw new Error(
            "You'll have to wait at least 10 minutes from when you renamed the thread to solve it.",
        );
    // Mark the thread as solved
    return await thread.edit({
        name: add_thread_prefix(thread.name, true).slice(0, 100),
        // Archiving immediately won't let users click the buttons.
        autoArchiveDuration: 60,
    });
}

export async function reopen_thread(thread: ThreadChannel) {
    // Make sure the thread is marked as solved
    if (!thread.name.startsWith('✅'))
        throw new Error("Thread's not marked as solved");
    // Make sure the thread is located in the HELP_THREAD_CHANNELS
    if (!HELP_THREAD_CHANNELS.includes(thread.parentId || ''))
        throw new Error('This command only works in a help thread');
    // Make sure the thread hasn't reached its reopening limit
    if (reopen_limit.is_limited(thread.id, true))
        throw new Error('You can only reopen a thread once every 24 hours');
    // Make sure the thread hasn't reached its renaming limit
    if (rename_limit.is_limited(thread.id, true))
        throw new Error(
            "You'll have to wait at least 10 minutes from when you renamed the thread to reopen it.",
        );
    // Mark the thread as reopened
    return await thread.edit({
        name: add_thread_prefix(thread.name, false).slice(0, 100),
        // Archiving immediately won't let users click the buttons.
        autoArchiveDuration: 1440,
    });
}

export async function check_autothread_permissions(
    thread: ThreadChannel,
    member: GuildMember,
): Promise<boolean> {
    const allowed_ids = [...THREAD_ADMIN_IDS, ...HELPER_ROLES];
    if (thread.ownerId) allowed_ids.push(thread.ownerId);

    await thread.fetchStarterMessage().then((message) => {
        allowed_ids.push(message.author.id);
    }, no_op);

    return has_any_role_or_id(member, allowed_ids);
}
/*
export async function get_ending_message(
    thread: ThreadChannel,
    initiator_id: Snowflake,
): Promise<InteractionReplyOptions> {
    // Attempt to load all members even if they aren't currently cached
    thread = await thread.fetch();

    const start_message = await undefined_on_error(
        thread.fetchStarterMessage(),
    );

    const clickable_participants = thread.guildMembers.filter(
        (m) =>
            DEV_MODE ||
            (!m.user.bot &&
                m.id !== (start_message?.author.id ?? initiator_id)),
    );

    const embed = build_embed({
        description: `Thread marked as solved.`,
    });

    const row = new ActionRowBuilder().setComponents(
        clickable_participants.map((m) =>
            new ButtonBuilder()
                .setCustomId(`thread_solver_${m.id}`)
                .setLabel(m.displayName)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(false),
        ),
    );

    return clickable_participants.size
        ? {
              components: [row],
              embeds: [embed],
          }
        : {
              embeds: [embed],
          };
}
*/
