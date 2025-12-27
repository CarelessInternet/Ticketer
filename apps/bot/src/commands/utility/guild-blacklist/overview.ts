import { DeferReply, Subcommand } from '@ticketer/djs-framework';
import { translate } from '@/i18n';
import { getBlacklists } from './helpers';

const dataTranslations = translate().commands['guild-blacklist'].data;

export default class extends Subcommand.Interaction {
	public readonly data = super.subcommand({
		parentCommandName: dataTranslations.name(),
		subcommandName: dataTranslations.subcommands[0].name(),
	});

	@DeferReply()
	public execute(context: Subcommand.Context) {
		void getBlacklists(context);
	}
}
