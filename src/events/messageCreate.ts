import {
	Message,
	MessageOptions,
	MessageActionRow,
	MessageButton,
	ThreadChannel,
} from 'discord.js';
import { event } from 'jellycommands';
import url_regex from 'url-regex-safe';
import { AUTO_THREAD_CHANNELS } from '../config';
import { wrap_in_embed } from '../utils/embed_helpers';
import { add_thread_prefix } from '../utils/threads';
import { get_title_from_url } from '../utils/unfurl';
import { Url } from 'url';

export default event({
	name: 'messageCreate',
	run: async ({ }, message) => {
		const should_ignore =
			message.author.bot ||
			message.channel.type != 'GUILD_TEXT' ||
			message.type != 'DEFAULT' ||
			!AUTO_THREAD_CHANNELS.includes(message.channelId);

		// If a response is sent by a user in an auto thread channel
		if (message.type === 'REPLY' && AUTO_THREAD_CHANNELS.includes(message.channelId) && !message.author.bot) {
			// Reply to their message with instructions
			const response = await message.reply(wrap_in_embed("Please send responses in the issues thread and not directly in this channel"))
			// Delete their message
			await message.delete()
			// Delete the response 5 seconds later
			setTimeout(() => {
				response.delete()
			}, 5000)
		}

		if (should_ignore) return;

		// Remove bloat from links and replace colons with semicolons
		const raw_name = message.content
			.replaceAll('http://', '')
			.replaceAll('https://', '')
			.replaceAll(':', ';');

		const name = AUTO_THREAD_CHANNELS.includes(message.channelId)
			? add_thread_prefix(raw_name, false)
			: raw_name;

		await message.channel.threads
			.create({
				name: name.length > 100 ? name.slice(0, 97) + '...' : name,
				startMessage: message,
			})
			.then(send_instruction_message);
	},
});

async function send_instruction_message(thread: ThreadChannel) {
	const base_description =
		"I've created a thread for your message. Please continue any discussion in this thread. You can rename it with the `/thread rename` command if I didn't set a proper name for it.";

	const description = AUTO_THREAD_CHANNELS.includes(thread.parentId!)
		? `${base_description}\n\nWhen your problem is solved close the thread with the \`/thread solve\` command.`
		: base_description;

	// Add the solve button to the message
	const msg = wrap_in_embed(description) as MessageOptions;
	const row = new MessageActionRow().addComponents(
		new MessageButton()
			.setCustomId('solve')
			.setLabel('Mark as Solved')
			.setStyle('PRIMARY')
			.setEmoji('✅'),
	);
	msg.components = [row];

	return await thread.send(msg);
}
