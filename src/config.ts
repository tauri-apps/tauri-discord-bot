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

// list of support roles without admin rights
export const HELPER_ROLES = DEV_MODE
	? [process.env.DEV_HELPER_ROLE]
	: [
			// Helping Hand
			'995034988699455609',
	  ];

export const BOT_DEVS = [
	// LorenzoLewis
	'402698003569180674',
	// Simon
	// '329752097530839041',
];

//  list of roles/user IDs other than the creator allowed to modify threads
export const THREAD_ADMIN_IDS = [...ADMIN_ROLES, ...BOT_DEVS];

// auto thread channels with the issue handling feature
export const HELP_THREAD_CHANNELS = DEV_MODE
	? [process.env.DEV_HELP_CHANNEL]
	: [
			// #help-triage
			'625037620996734986',
	  ];

// channels that will be automatically threaded when a message is created
export const AUTO_THREAD_CHANNELS = DEV_MODE
	? [process.env.DEV_DID_A_THING_CHANNEL, ...HELP_THREAD_CHANNELS]
	: [
			// #did-a-thing
			'616234029842300930',
			...HELP_THREAD_CHANNELS,
	  ];

export const REACTION_ROLE: {
	emojiName: string;
	emojiId: string;
	roleId: string;
	description: string;
}[] = DEV_MODE
	? [
			{
				emojiName: 'sausageroll',
				emojiId: '995712110925451324',
				roleId: process.env.DEV_REACTION_ROLE,
				description:
					'Join the conversation in the contributors channels (you can still view without this role)',
			},
	  ]
	: [
			{
				emojiName: 'tauri',
				emojiId: '876938722266972210',
				roleId: '986176820187631616',
				description:
					'Join the conversation in the contributors channels (you can still view without this role)',
			},
	  ];

export const REACTION_ROLE_CHANNEL = DEV_MODE
	? process.env.DEV_REACTION_ROLE_CHANNEL
	: '616210923354456064';
