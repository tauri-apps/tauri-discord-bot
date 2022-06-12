export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = process.env.TEST_GUILD_ID ?? '985638857200517142';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const SVELTE_ORANGE = 0xff3e00;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// #region people
const ADMIN_ROLES = [
	// Threadlords
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
	// cirilla
	'339731096793251854',

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

export const LINK_ONLY_CHANNELS = [
	// #test-link-validation
	'918915215368810566',

	// #both-both-is-good
	'919196322303725568',
];

export const AUTO_THREAD_CHANNELS = DEV_MODE
	? [
			// #test-auto-thread
			'985638857712218114',

			// #both-both-is-good
			'985638857712218114',

			// emulated help channel
			'985638857712218114',
	  ]
	: [...HELP_CHANNELS];
// #endregion
