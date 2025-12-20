import type { DeepPartial } from '@/utils';
import type { Translation } from '../i18n-types';
import ERROR_TITLE from './errorTitle';

export default {
	actions: {
		_errorIfNotThreadChannel: {
			title: ERROR_TITLE,
			description: 'Kanalen är inte en giltigt trådkanal.',
		},
		_errorIfNotThreadAuthorOrManager: {
			title: ERROR_TITLE,
			description: 'Du måste vara trådägaren eller trådansvarigt för att köra den/det här knappen/kommandot.',
		},
		renameTitle: {
			builder: {
				label: 'Ändra Titeln',
			},
			component: {
				modal: {
					title: 'Ändra Trådtiteln',
					inputs: [
						{
							label: 'Trådtitel',
							description: 'Skriv den nya titeln som ska användas för tråden.',
						},
					],
				},
			},
			modal: {
				errors: {
					notEditable: {
						title: ERROR_TITLE,
						description: 'Jag har inte behörighet att redigera titeln i trådkanalen.',
					},
				},
				success: {
					title: 'Tråden Ändrade Namn',
					description: 'Trådtiteln har ändrats från "{oldTitle}" till "{newTitle}".',
				},
			},
		},
		lock: {
			builder: {
				label: 'Låsa',
			},
			execute: {
				errors: {
					notManageable: {
						title: ERROR_TITLE,
						description: 'Jag har inte de nödvändiga behörigheter för att låsa trådkanalen.',
					},
				},
				success: {
					title: 'Tråd Låst',
					description: 'Tråden var låst framgångsrikt!',
				},
			},
		},
		close: {
			builder: {
				label: 'Stänga',
			},
			execute: {
				errors: {
					notEditable: {
						title: ERROR_TITLE,
						description: 'Jag har inte behörighet att stänga tråden.',
					},
				},
				success: {
					title: 'Tråd Stängt',
					description: 'Tråden stängdes framgångsrikt!',
				},
			},
		},
		lockAndClose: {
			builder: {
				label: 'Låsa & Stänga',
			},
			execute: {
				errors: {
					notManageableAndEditable: {
						title: ERROR_TITLE,
						description: 'Jag har inte de nödvändiga behörigheter för att låsa och stänga trådkanalen.',
					},
				},
				success: {
					title: 'Tråd Låst & Stängt',
					description: 'Tråden var låst och stängt framgångsrikt!',
				},
			},
		},
		delete: {
			builder: {
				label: 'Radera',
			},
			execute: {
				errors: {
					notManageable: {
						title: ERROR_TITLE,
						description: 'Jag har inte de nödvändiga behörigheter för att låsa trådkanalen.',
					},
				},
				success: {
					title: 'Raderar Tråden...',
					description: 'Jag försöker att radera tråden...',
				},
			},
		},
	},
} satisfies DeepPartial<Translation['tickets']['userForums']>;
