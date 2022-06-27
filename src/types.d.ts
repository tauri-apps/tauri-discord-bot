import { SharedNameAndDescription } from '@discordjs/builders';

export interface Command {
	data: SharedNameAndDescription | null;
	run: (interaction: BaseCommandInteraction, [string]: any) => void;
}
