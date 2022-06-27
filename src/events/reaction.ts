import { Client, MessageReaction, User } from 'discord.js';

export default function run(client: Client) {
	client.on('messageReactionAdd', async (interaction, user) => {
		console.log(interaction, user.id);
	});

	client.on('messageReactionRemove', async (interaction, user) => {
		console.log(interaction, user.id);
	});
}
