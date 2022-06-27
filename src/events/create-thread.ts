import { Client } from 'discord.js';

export default function run(client: Client) {
	client.on('messageCreate', async (message) => {
		if (message.channel.type != 'GUILD_TEXT') return;
		if (message.author.id == client.user.id) return;

		message.channel.threads
			.create({
				name: `❔${message.content}`,
			})
			.then((thread) => {
				thread.send({
					content: "I've created a thread for your question",
				});
				console.log(thread);
			})
			.catch(console.error);
	});
}
