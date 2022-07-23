import {
	Message,
	MessageOptions,
	MessageActionRow,
	MessageButton,
	ThreadChannel,
	ThreadManager,
	TextChannel,
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
		// Rules for whether or not the message should be dealt with by the bot
		const should_ignore =
			message.author.bot ||
			message.channel.type != 'GUILD_TEXT' ||
			message.type != 'DEFAULT' ||
			!AUTO_THREAD_CHANNELS.includes(message.channelId);

		// If a response is sent by a user in an auto thread channel
		if (message.type === 'REPLY' && AUTO_THREAD_CHANNELS.includes(message.channelId) && !message.author.bot) {
			// Get the channel as a TextChannel
			const channel = message.channel as TextChannel
			// Get the thread that the message refers to
			let thread = channel.threads.cache.get(message.reference.messageId) as ThreadChannel
			// If the thread wasn't found in the cache
			if (!thread) {
				// Get all active threads in the guild
				const threads = (await message.guild.channels.fetchActiveThreads()).threads
				// Get the thread
				thread = threads.get(message.reference.messageId) as ThreadChannel
			}
			// Make msg available outside the if/else scope
			let msg;
			// If the thread was found
			if (thread) {
				// Create a message that mentions  the user
				const usersMessage = wrap_in_embed(`Response by <@${message.author.id}>`) as MessageOptions
				// Put their original message contents in the new message
				usersMessage.content = message.content
				// Send the message to the thread
				await thread.send(usersMessage)
				// Create response message to the user with a link to the thread
				msg = wrap_in_embed(`Please send responses in the issues thread and not directly in this channel\n\n<#${thread.id}>`)
			} else {
				// Create response message to the user
				msg = wrap_in_embed(`Please send responses in the issues thread and not directly in this channel`)
			}
			// Reply to the user
			const response = await message.reply(msg)
			// Delete their message
			await message.delete()
			// Delete the response 5 seconds later
			setTimeout(() => {
				response.delete()
			}, 10000)
		}

		// If the message should be ignored, return without further processing
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
