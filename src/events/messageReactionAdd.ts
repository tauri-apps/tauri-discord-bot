import { event } from 'jellycommands';
import { hasPermission } from '../utils/reactionHandler';

export default event({
    name: 'messageReactionAdd',
    run: async (_, reaction, user) => {
        try {
            const result = await hasPermission(reaction, user);

            result.member.roles.add(result.roleId);
        } catch (error) {
            console.error(`Issue in reactionAdd: ${error}`);
        }
    },
});
