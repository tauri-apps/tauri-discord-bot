export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = process.env.TEST_GUILD_ID ?? '985638857200517142';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const TAURI_BLUE = 0x67d6ed;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// #region people
const ADMIN_ROLES = [
	// All users
	'402698003569180674',
];

// For use in dev server
const TEST_ADMIN_ROLES = ['402698003569180674'];

/**
 * List of roles/user IDs allowed to delete tags even if they're not the author.
 */
export const TAG_DEL_PERMITTED_IDS = DEV_MODE ? TEST_ADMIN_ROLES : ADMIN_ROLES;

/**
 * List of roles/user IDs allowed to create tags.
 */
export const TAG_CREATE_PERMITTED_IDS = DEV_MODE
	? TEST_ADMIN_ROLES
	: ADMIN_ROLES;

export const BOT_DEVS = [
	// LorenzoLewis
	'402698003569180674',
];
/**
 * List of roles/user IDs other than the creator allowed to modify threads.
 */
export const THREAD_ADMIN_IDS = [
	...BOT_DEVS,
	...(DEV_MODE ? TEST_ADMIN_ROLES : ADMIN_ROLES),
];

// #endregion

// #region channels
export const HELP_CHANNELS = DEV_MODE
	? ['985638857712218114']
	: [
			// svelte-help
			'985638857712218114',
	  ];

export const AUTO_THREAD_CHANNELS = DEV_MODE
	? [
			// #test-auto-thread
			'985638857712218114',
	  ]
	: [...HELP_CHANNELS];
// #endregion
