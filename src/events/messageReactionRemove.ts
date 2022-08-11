import { event } from 'jellycommands';
import { hasPermission } from '../utils/reactionHandler';

export default event({
	name: 'messageReactionRemove',
	run: async (_, reaction, user) => {
		try {
			const result = await hasPermission(reaction, user);

			result.member.roles.remove(result.roleId);
		} catch (error) {
			console.error(`Issue in reactionRemove: ${error}`);
		}
	},
});
