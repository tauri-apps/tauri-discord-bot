import { event } from 'jellycommands';
import { sendReactionRoleMessage } from '../utils/reactionHandler';

export default event({
    name: 'ready',
    run: (_, client) => {
        sendReactionRoleMessage(client);

        console.log(client.user.tag, 'is online!');        
    },
});
