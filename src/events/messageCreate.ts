import { Message, MessageOptions, MessageActionRow, MessageButton, ThreadChannel } from 'discord.js';
import { event } from 'jellycommands';
import url_regex from 'url-regex-safe';
import { AUTO_THREAD_CHANNELS } from '../config';
import { wrap_in_embed } from '../utils/embed_helpers';
import { add_thread_prefix } from '../utils/threads';
import { get_title_from_url } from '../utils/unfurl';

export default event({
	name: 'messageCreate',
	run: async ({ }, message) => {
		const should_ignore =
			message.author.bot ||
			message.channel.type != 'GUILD_TEXT' ||
			message.type != 'DEFAULT' ||
			!AUTO_THREAD_CHANNELS.includes(message.channelId);

		if (should_ignore) return;

		const raw_name = await get_thread_name(message);

		const name = AUTO_THREAD_CHANNELS.includes(message.channelId)
			? add_thread_prefix(raw_name, false)
			: raw_name;

		await message.channel.threads
			.create({
				name: name.slice(0, 100),
				startMessage: message,
			})
			.then(send_instruction_message);
	},
});

function get_thread_name(message: Message): string | Promise<string> {
	const url = message.content.match(url_regex());

	// If the url can't be matched
	if (!url) return `${message.content.replace(url_regex(), '')}`;

	return get_title_from_url(url[0]);
}

async function send_instruction_message(thread: ThreadChannel) {
	const base_description =
		"I've created a thread for your message. Please continue any relevant discussion in this thread. You can rename it with the `/thread rename` command if I failed to set a proper name for it."

	const description = AUTO_THREAD_CHANNELS.includes(thread.parentId!)
		? `${base_description}\n\nWhen your problem is solved close the thread with the \`/thread solve\` command.`
		: base_description;

	// Add the solve button to the message
	const msg = wrap_in_embed(description) as MessageOptions
	const row = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('solve')
				.setLabel('Mark as Solved')
				.setStyle('PRIMARY')
				.setEmoji('✅'),
		);
	msg.components = [row]

	return await thread.send(msg);
}
