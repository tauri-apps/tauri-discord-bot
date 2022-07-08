import { event } from 'jellycommands';
import { sendStartupMessage } from '../utils/reactionHandler';

export default event({
	name: 'ready',
	run: (_, client) => {
		sendStartupMessage(client);

		console.log(client.user.tag, 'is online!');
	},
});
