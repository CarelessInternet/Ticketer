import ERROR_TITLE from './errorTitle';

export default {
	buttons: {
		_errorIfNotThreadChannel: {
			title: ERROR_TITLE,
			description: 'The channel is not a valid thread channel.',
		},
		_errorIfNotThreadAuthorOrManager: {
			title: ERROR_TITLE,
			description: 'You need to be the thread author or manager to execute this button/command.',
		},
		renameTitle: {
			builder: {
				label: 'Rename Title',
			},
			component: {
				modal: {
					title: 'Rename Thread Title',
					inputs: [
						{
							label: 'Thread Title',
							placeholder: 'Write the new title that should be used for the thread.',
						},
					],
				},
			},
			modal: {
				errors: {
					notEditable: {
						title: ERROR_TITLE,
						description: 'I do not have the permission to edit the title.',
					},
				},
				success: {
					title: 'Thread Renamed',
					description: 'The thread has been renamed from "{oldTitle:string}" to "{newTitle:string}".',
				},
			},
		},
		lock: {
			builder: {
				label: 'Lock',
			},
			execute: {
				errors: {
					notManageable: {
						title: ERROR_TITLE,
						description: 'I do not have the necessary permission(s) to lock the thread.',
					},
				},
				success: {
					title: 'Thread Locked',
					description: 'The thread has been successfully locked!',
				},
			},
		},
		close: {
			builder: {
				label: 'Close',
			},
			execute: {
				errors: {
					notEditable: {
						title: ERROR_TITLE,
						description: 'I do not have the permission to close the thread.',
					},
				},
				success: {
					title: 'Thread Closed',
					description: 'The thread has been successfully closed!',
				},
			},
		},
		lockAndClose: {
			builder: {
				label: 'Lock & Close',
			},
			execute: {
				errors: {
					notManageableAndEditable: {
						title: ERROR_TITLE,
						description: 'I do not have the necessary permission(s) to lock and close the thread.',
					},
				},
				success: {
					title: 'Thread Locked & Closed',
					description: 'The thread has been successfully locked and closed!',
				},
			},
		},
		delete: {
			builder: {
				label: 'Delete',
			},
			execute: {
				errors: {
					notManageable: {
						title: ERROR_TITLE,
						description: 'I do not have the necessary permission(s) to lock the thread.',
					},
				},
				success: {
					title: 'Deleting Thread...',
					description: 'I am attempting to delete the thread...',
				},
			},
		},
	},
};
