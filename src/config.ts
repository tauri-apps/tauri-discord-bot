export const DEV_MODE = process.env.NODE_ENV !== 'production';

export const GUILD_ID = DEV_MODE
	? process.env.DEV_GUILD_ID
	: '616186924390023171';

export const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

export const TAURI_BLUE = 0x67d6ed;

// people
const ADMIN_ROLES = DEV_MODE
	? [process.env.DEV_ADMIN_ROLE]
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

//  list of roles/user IDs other than the creator allowed to modify threads
export const THREAD_ADMIN_IDS = [...ADMIN_ROLES, ...BOT_DEVS];

// channels that will be automatically threaded when a message is created
export const AUTO_THREAD_CHANNELS = DEV_MODE
	? [process.env.DEV_HELP_CHANNEL]
	: [
			// #help-triage
			'625037620996734986',
	  ];

export const REACTION_ROLE: { [key: string]: string } = DEV_MODE
	? {
			'✅': process.env.DEV_REACTION_ROLE,
			'🍕': process.env.DEV_REACTION_ROLE,
	  }
	: { '994706644850184322': '986176820187631616' };

export const REACTION_ROLE_CHANNEL = DEV_MODE
	? process.env.DEV_REACTION_ROLE_CHANNEL
	: '';
