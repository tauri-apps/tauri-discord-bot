import { event } from 'jellycommands';
import { wrap_in_embed } from '../utils/embed_helpers.js';

export default event({
	name: 'messageCreate',

	run: async ({}, message) => {
		if (message.author.bot) return;
	},
});
