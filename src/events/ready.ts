import { event } from 'jellycommands';
import { sendMessage } from './reaction';

export default event({
	name: 'ready',
	run: (_, client) => {
		sendMessage(client);

		console.log(client.user.tag, 'is online!');
	},
});
