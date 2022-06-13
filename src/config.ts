export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const TEST_GUILD_ID = DEV_MODE ? '985638857200517142' : '616186924390023171';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const TAURI_BLUE = 0x67d6ed;

// people
const ADMIN_ROLES = DEV_MODE
	? ['402698003569180674']
	: [
			// admin
			'985400380663935088',
			// core
			'616187491715907585',
			// working-group
			'761977421305610241',
	  ];

export const BOT_DEVS = [
	// LorenzoLewis
	'402698003569180674',
];

/**
 * List of roles/user IDs other than the creator allowed to modify threads.
 */
export const THREAD_ADMIN_IDS = [...BOT_DEVS, ...ADMIN_ROLES];

// channels
export const HELP_CHANNELS = DEV_MODE
	? ['985680061703290932']
	: [
			// #troubleshooting
			'985862540905033748',
	  ];

export const AUTO_THREAD_CHANNELS = [...HELP_CHANNELS];
