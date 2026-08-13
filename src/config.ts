export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const GUILD_ID = DEV_MODE
    ? process.env.DEV_GUILD_ID ?? '0'
    : '616186924390023171';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const TAURI_BLUE = 0x67d6ed;

// people
const ADMIN_ROLES = DEV_MODE
    ? [process.env.DEV_ADMIN_ROLE ?? '0']
    : [
          // admin
          '985400380663935088',
          // mod
          '1115985763423748227',
          // working-group
          '761977421305610241',
      ];

//  list of roles/user IDs other than the creator allowed to modify threads
export const THREAD_ADMIN_IDS = [...ADMIN_ROLES];

export const REACTION_ROLE_CHANNEL = DEV_MODE
    ? process.env.DEV_REACTION_ROLE_CHANNEL ?? '0'
    : '616210923354456064';

export const SUPPORT_FORUM = DEV_MODE
    ? process.env.DEV_SUPPORT_FORUM_CHANNEL ?? '0'
    : '1047150269156294677';
export const SOLVABLE_FORUMS = [SUPPORT_FORUM];
export const UNSOLVED_TAG = 'unsolved';
export const SOLVED_TAG = 'solved';

export const JOBS_FORUM = DEV_MODE
    ? process.env.DEV_JOBS_FORUM_CHANNEL ?? '0'
    : '1115940750044168192';
