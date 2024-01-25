// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType
export type BaseLocale = 'en-GB'

export type Locales =
	| 'en-GB'
	| 'en-US'
	| 'sv-SE'

export type Translation = RootTranslation

export type Translations = RootTranslation

type RootTranslation = {
	commands: {
		close: {
			data: {
				/**
				 * c​l​o​s​e
				 */
				name: string
				/**
				 * C​l​o​s​e​/​A​r​c​h​i​v​e​ ​t​h​e​ ​t​h​r​e​a​d​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.
				 */
				description: string
			}
		}
		'delete': {
			data: {
				/**
				 * d​e​l​e​t​e
				 */
				name: string
				/**
				 * D​e​l​e​t​e​ ​t​h​e​ ​t​h​r​e​a​d​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.
				 */
				description: string
			}
		}
		help: {
			data: {
				/**
				 * h​e​l​p
				 */
				name: string
				/**
				 * V​i​e​w​ ​a​l​l​ ​a​v​a​i​l​a​b​l​e​ ​c​o​m​m​a​n​d​s​.
				 */
				description: string
				options: {
					'0': {
						/**
						 * h​i​d​d​e​n
						 */
						name: string
						/**
						 * W​h​e​t​h​e​r​ ​t​h​e​ ​m​e​s​s​a​g​e​ ​s​h​o​u​l​d​ ​b​e​ ​s​h​o​w​n​ ​t​o​ ​y​o​u​ ​o​r​ ​e​v​e​r​y​b​o​d​y​.
						 */
						description: string
					}
				}
			}
			command: {
				embeds: {
					'0': {
						/**
						 * C​o​m​m​a​n​d​ ​L​i​s​t
						 */
						title: string
						/**
						 * H​e​r​e​ ​i​s​ ​t​h​e​ ​l​i​s​t​ ​o​f​ ​t​h​e​ ​a​v​a​i​l​a​b​l​e​ ​c​o​m​m​a​n​d​s​:​ ​{​c​o​m​m​a​n​d​s​}​.
						 * @param {string} commands
						 */
						description: RequiredParams<'commands'>
						fields: {
							'0': {
								/**
								 * �​�​ ​L​i​n​k​s
								 */
								name: string
								links: {
									/**
									 * I​n​v​i​t​e​ ​L​i​n​k
									 */
									invite: string
									/**
									 * S​u​p​p​o​r​t​ ​S​e​r​v​e​r
									 */
									supportServer: string
								}
							}
						}
					}
				}
			}
		}
		lock: {
			data: {
				/**
				 * l​o​c​k
				 */
				name: string
				/**
				 * L​o​c​k​ ​t​h​e​ ​t​h​r​e​a​d​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.
				 */
				description: string
			}
		}
		migrate: {
			data: {
				/**
				 * m​i​g​r​a​t​e
				 */
				name: string
				/**
				 * D​e​p​l​o​y​ ​a​n​y​ ​d​a​t​a​b​a​s​e​ ​m​i​g​r​a​t​i​o​n​s​ ​t​h​a​t​ ​m​a​y​ ​b​e​ ​r​e​q​u​i​r​e​d​.
				 */
				description: string
			}
			command: {
				/**
				 * S​u​c​c​e​s​s​f​u​l​l​y​ ​m​i​g​r​a​t​e​d​ ​t​h​e​ ​d​a​t​a​b​a​s​e​!
				 */
				success: string
			}
		}
		ping: {
			data: {
				/**
				 * p​i​n​g
				 */
				name: string
				/**
				 * V​i​e​w​ ​t​h​e​ ​l​a​t​e​n​c​y​ ​a​n​d​ ​s​t​a​t​u​s​ ​o​f​ ​t​h​e​ ​b​o​t​.
				 */
				description: string
			}
			command: {
				embeds: {
					'0': {
						/**
						 * P​i​n​g​i​n​g​.​.​.
						 */
						title: string
					}
					'1': {
						/**
						 * R​e​s​u​l​t
						 */
						title: string
						fields: {
							'0': {
								/**
								 * P​i​n​g
								 */
								name: string
								/**
								 * ⌛​ ​{​m​s​}​m​s
								 * @param {number} ms
								 */
								value: RequiredParams<'ms'>
							}
							'1': {
								/**
								 * L​a​t​e​n​c​y
								 */
								name: string
								/**
								 * �​�​ ​R​o​u​g​h​l​y​ ​{​m​s​}​m​s
								 * @param {number} ms
								 */
								value: RequiredParams<'ms'>
							}
							'2': {
								/**
								 * W​e​b​S​o​c​k​e​t​ ​S​t​a​t​u​s
								 */
								name: string
								/**
								 * ⚙​️​ ​{​s​t​a​t​u​s​}
								 * @param {string} status
								 */
								value: RequiredParams<'status'>
							}
						}
					}
				}
			}
		}
		purge: {
			data: {
				/**
				 * p​u​r​g​e
				 */
				name: string
				/**
				 * R​e​m​o​v​e​ ​t​h​e​ ​l​a​t​e​s​t​ ​m​e​s​s​a​g​e​s​ ​i​n​ ​t​h​e​ ​c​u​r​r​e​n​t​ ​c​h​a​n​n​e​l​ ​b​y​ ​t​h​e​ ​s​p​e​c​i​f​i​e​d​ ​a​m​o​u​n​t​.
				 */
				description: string
				options: {
					'0': {
						/**
						 * a​m​o​u​n​t
						 */
						name: string
						/**
						 * T​h​e​ ​a​m​o​u​n​t​ ​o​f​ ​m​e​s​s​a​g​e​s​ ​t​o​ ​d​e​l​e​t​e​.
						 */
						description: string
					}
				}
			}
			command: {
				embeds: {
					'0': {
						/**
						 * P​u​r​g​e​d​ ​M​e​s​s​a​g​e​s
						 */
						title: string
						/**
						 * S​u​c​c​e​s​s​f​u​l​l​y​ ​d​e​l​e​t​e​d​ ​t​h​e​ ​l​a​s​t​ ​{​a​m​o​u​n​t​}​ ​m​e​s​s​a​g​e​s​!
						 * @param {number} amount
						 */
						description: RequiredParams<'amount'>
					}
				}
			}
		}
		'rename-title': {
			data: {
				/**
				 * r​e​n​a​m​e​-​t​i​t​l​e
				 */
				name: string
				/**
				 * R​e​n​a​m​e​ ​t​h​e​ ​t​i​t​l​e​ ​o​f​ ​t​h​e​ ​t​h​r​e​a​d​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.
				 */
				description: string
			}
		}
		'show-tickets': {
			data: {
				/**
				 * s​h​o​w​-​t​i​c​k​e​t​s
				 */
				name: string
				/**
				 * S​h​o​w​ ​t​h​e​ ​t​i​c​k​e​t​s​ ​y​o​u​ ​h​a​v​e​ ​i​n​ ​t​h​e​ ​s​e​r​v​e​r​.
				 */
				description: string
				options: {
					'0': {
						/**
						 * s​t​a​t​e
						 */
						name: string
						/**
						 * F​i​l​t​e​r​ ​b​y​ ​t​h​e​ ​t​i​c​k​e​t​s​'​ ​s​t​a​t​e​s​.
						 */
						description: string
					}
				}
			}
			command: {
				buttons: {
					previous: {
						/**
						 * P​r​e​v​i​o​u​s​ ​P​a​g​e
						 */
						label: string
					}
					next: {
						/**
						 * N​e​x​t​ ​P​a​g​e
						 */
						label: string
					}
				}
				/**
				 * T​o​t​a​l​ ​a​m​o​u​n​t​ ​o​f​ ​t​i​c​k​e​t​s​ ​b​y​ ​y​o​u​ ​i​n​ ​t​h​e​ ​s​e​r​v​e​r​:​ ​{​a​m​o​u​n​t​}​.
				 * @param {number} amount
				 */
				content: RequiredParams<'amount'>
				embeds: {
					'0': {
						fields: {
							'0': {
								/**
								 * T​h​r​e​a​d​ ​C​h​a​n​n​e​l
								 */
								name: string
							}
							'1': {
								/**
								 * S​t​a​t​e
								 */
								name: string
							}
						}
					}
				}
			}
		}
		ticket: {
			data: {
				/**
				 * t​i​c​k​e​t
				 */
				name: string
				/**
				 * C​r​e​a​t​e​ ​a​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​w​i​t​h​i​n​ ​a​ ​c​a​t​e​g​o​r​y​.
				 */
				description: string
			}
		}
	}
	events: {
		interactionCreate: {
			ownerOnly: {
				/**
				 * Y​o​u​ ​n​e​e​d​ ​t​o​ ​b​e​ ​t​h​e​ ​o​w​n​e​r​ ​o​f​ ​t​h​e​ ​b​o​t​ ​t​o​ ​r​u​n​ ​t​h​i​s​ ​c​o​m​m​a​n​d​!
				 */
				error: string
			}
		}
		guildMemberAdd: {
			welcome: {
				/**
				 * W​e​l​c​o​m​e​ ​{​m​e​m​b​e​r​}​!
				 * @param {string} member
				 */
				title: RequiredParams<'member'>
				/**
				 * {​m​e​m​b​e​r​}​ ​T​h​a​n​k​ ​y​o​u​ ​f​o​r​ ​j​o​i​n​i​n​g​ ​t​h​e​ ​s​e​r​v​e​r​!
				 * @param {string} member
				 */
				message: RequiredParams<'member'>
			}
			farewell: {
				/**
				 * G​o​o​d​b​y​e​ ​{​m​e​m​b​e​r​}​!
				 * @param {string} member
				 */
				title: RequiredParams<'member'>
				/**
				 * {​m​e​m​b​e​r​}​ ​h​a​s​ ​l​e​f​t​ ​t​h​e​ ​s​e​r​v​e​r​.
				 * @param {string} member
				 */
				message: RequiredParams<'member'>
			}
		}
	}
	tickets: {
		threads: {
			categories: {
				configuration: {
					openingMessage: {
						/**
						 * {​c​a​t​e​g​o​r​y​}​:​ ​N​e​w​ ​S​u​p​p​o​r​t​ ​T​i​c​k​e​t
						 * @param {string} category
						 */
						title: RequiredParams<'category'>
						/**
						 * {​m​e​m​b​e​r​}​ ​c​r​e​a​t​e​d​ ​a​ ​n​e​w​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​i​n​ ​t​h​e​ ​{​c​a​t​e​g​o​r​y​}​ ​c​a​t​e​g​o​r​y​!
						 * @param {string} category
						 * @param {string} member
						 */
						description: RequiredParams<'category' | 'member'>
					}
				}
				categoryList: {
					/**
					 * S​e​l​e​c​t​ ​a​ ​c​a​t​e​g​o​r​y​ ​t​o​ ​c​r​e​a​t​e​ ​a​ ​t​i​c​k​e​t​ ​w​i​t​h​i​n​.
					 */
					placeholder: string
				}
				createModal: {
					errors: {
						invalidCustomId: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * T​h​e​ ​c​u​s​t​o​m​ ​I​D​ ​c​o​u​l​d​ ​n​o​t​ ​b​e​ ​f​o​u​n​d​.
							 */
							description: string
						}
					}
					title: {
						/**
						 * T​i​t​l​e
						 */
						label: string
						/**
						 * W​r​i​t​e​ ​a​ ​t​i​t​l​e​ ​t​o​ ​b​e​ ​u​s​e​d​ ​i​n​ ​t​h​e​ ​t​i​c​k​e​t​.
						 */
						placeholder: string
					}
					description: {
						/**
						 * D​e​s​c​r​i​p​t​i​o​n
						 */
						label: string
						/**
						 * W​r​i​t​e​ ​a​ ​d​e​s​c​r​i​p​t​i​o​n​ ​t​o​ ​b​e​ ​u​s​e​d​ ​i​n​ ​t​h​e​ ​t​i​c​k​e​t​.
						 */
						placeholder: string
					}
					/**
					 * T​i​c​k​e​t​ ​T​i​t​l​e​ ​&​ ​D​e​s​c​r​i​p​t​i​o​n
					 */
					modalTitle: string
				}
				createTicket: {
					errors: {
						invalidUser: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * A​ ​t​i​c​k​e​t​ ​f​o​r​ ​m​y​s​e​l​f​ ​c​a​n​n​o​t​ ​b​e​ ​c​r​e​a​t​e​d​,​ ​y​o​u​ ​s​i​l​l​y​.
							 */
							description: string
						}
						noCategories: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * N​o​ ​t​i​c​k​e​t​ ​c​a​t​e​g​o​r​i​e​s​ ​c​o​u​l​d​ ​b​e​ ​f​o​u​n​d​.
							 */
							description: string
						}
						invalidId: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * T​h​e​ ​c​a​t​e​g​o​r​y​ ​I​D​ ​i​s​ ​n​o​t​ ​v​a​l​i​d​.
							 */
							description: string
						}
						noConfiguration: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * T​h​e​ ​g​l​o​b​a​l​ ​o​r​ ​c​a​t​e​g​o​r​y​ ​c​o​n​f​i​g​u​r​a​t​i​o​n​ ​c​o​u​l​d​ ​n​o​t​ ​b​e​ ​f​o​u​n​d​.
							 */
							description: string
						}
						noManagers: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * T​h​e​r​e​ ​a​r​e​ ​n​o​ ​m​a​n​a​g​e​r​s​ ​t​o​ ​a​d​d​ ​t​o​ ​t​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.
							 */
							description: string
						}
						invalidChannel: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * T​h​e​ ​t​i​c​k​e​t​ ​c​h​a​n​n​e​l​ ​d​o​e​s​ ​n​o​t​ ​e​x​i​s​t​ ​o​r​ ​i​s​ ​n​o​t​ ​a​ ​t​e​x​t​ ​c​h​a​n​n​e​l​.
							 */
							description: string
						}
						noPermissions: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							/**
							 * I​ ​d​o​n​'​t​ ​h​a​v​e​ ​t​h​e​ ​r​e​q​u​i​r​e​d​ ​p​e​r​m​i​s​s​i​o​n​s​ ​i​n​ ​t​h​e​ ​c​h​a​n​n​e​l​ ​t​o​ ​c​r​e​a​t​e​ ​a​ ​t​i​c​k​e​t​:​ ​{​p​e​r​m​i​s​s​i​o​n​s​}​.
							 * @param {string} permissions
							 */
							description: RequiredParams<'permissions'>
						}
						tooManyTickets: {
							/**
							 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
							 */
							title: string
							user: {
								/**
								 * Y​o​u​ ​h​a​v​e​ ​t​o​o​ ​m​a​n​y​ ​a​c​t​i​v​e​ ​t​i​c​k​e​t​s​,​ ​y​o​u​ ​m​a​y​ ​n​o​t​ ​h​a​v​e​ ​m​o​r​e​ ​t​h​a​n​ ​{​a​m​o​u​n​t​}​.
								 * @param {number} amount
								 */
								description: RequiredParams<'amount'>
							}
							proxy: {
								/**
								 * {​m​e​m​b​e​r​}​ ​h​a​s​ ​t​o​o​ ​m​a​n​y​ ​a​c​t​i​v​e​ ​t​i​c​k​e​t​s​,​ ​t​h​e​y​ ​m​a​y​ ​n​o​t​ ​h​a​v​e​ ​m​o​r​e​ ​t​h​a​n​ ​{​a​m​o​u​n​t​}​.
								 * @param {number} amount
								 * @param {string} member
								 */
								description: RequiredParams<'amount' | 'member'>
							}
						}
					}
					ticketCreated: {
						/**
						 * T​i​c​k​e​t​ ​C​r​e​a​t​e​d​!
						 */
						title: string
						notProxy: {
							user: {
								/**
								 * Y​o​u​r​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​h​a​s​ ​b​e​e​n​ ​c​r​e​a​t​e​d​!​ ​V​i​e​w​ ​i​t​ ​a​t​ ​{​c​h​a​n​n​e​l​}​.
								 * @param {string} channel
								 */
								description: RequiredParams<'channel'>
							}
							logs: {
								/**
								 * {​m​e​m​b​e​r​}​ ​h​a​s​ ​c​r​e​a​t​e​d​ ​a​ ​t​i​c​k​e​t​!​ ​V​i​e​w​ ​i​t​ ​a​t​ ​{​c​h​a​n​n​e​l​}​.
								 * @param {string} channel
								 * @param {string} member
								 */
								description: RequiredParams<'channel' | 'member'>
							}
						}
						proxy: {
							user: {
								/**
								 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​f​o​r​ ​{​m​e​m​b​e​r​}​ ​h​a​s​ ​b​e​e​n​ ​c​r​e​a​t​e​d​!​ ​V​i​e​w​ ​i​t​ ​a​t​ ​{​c​h​a​n​n​e​l​}​.
								 * @param {string} channel
								 * @param {string} member
								 */
								description: RequiredParams<'channel' | 'member'>
							}
							logs: {
								/**
								 * {​c​r​e​a​t​o​r​}​ ​c​r​e​a​t​e​d​ ​a​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​b​y​ ​p​r​o​x​y​ ​f​o​r​ ​{​m​e​m​b​e​r​}​!​ ​V​i​e​w​ ​i​t​ ​a​t​ ​{​c​h​a​n​n​e​l​}​.
								 * @param {string} channel
								 * @param {string} creator
								 * @param {string} member
								 */
								description: RequiredParams<'channel' | 'creator' | 'member'>
							}
						}
					}
				}
				buttons: {
					_errorIfNotTicketChannel: {
						/**
						 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
						 */
						title: string
						/**
						 * T​h​e​ ​c​h​a​n​n​e​l​ ​i​s​ ​n​o​t​ ​a​ ​v​a​l​i​d​ ​t​i​c​k​e​t​ ​c​h​a​n​n​e​l​.
						 */
						description: string
					}
					_errorIfNotTicketAuthorOrManager: {
						/**
						 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
						 */
						title: string
						/**
						 * Y​o​u​ ​n​e​e​d​ ​t​o​ ​b​e​ ​t​h​e​ ​t​i​c​k​e​t​ ​a​u​t​h​o​r​ ​o​r​ ​m​a​n​a​g​e​r​ ​t​o​ ​e​x​e​c​u​t​e​ ​t​h​i​s​ ​b​u​t​t​o​n​/​c​o​m​m​a​n​d​.
						 */
						description: string
					}
					renameTitle: {
						builder: {
							/**
							 * R​e​n​a​m​e​ ​T​i​t​l​e
							 */
							label: string
						}
						component: {
							modal: {
								/**
								 * R​e​n​a​m​e​ ​T​h​r​e​a​d​ ​T​i​t​l​e
								 */
								title: string
								inputs: {
									'0': {
										/**
										 * T​h​r​e​a​d​ ​T​i​t​l​e
										 */
										label: string
										/**
										 * W​r​i​t​e​ ​t​h​e​ ​n​e​w​ ​t​i​t​l​e​ ​t​h​a​t​ ​s​h​o​u​l​d​ ​b​e​ ​u​s​e​d​ ​f​o​r​ ​t​h​e​ ​t​h​r​e​a​d​.
										 */
										placeholder: string
									}
								}
							}
						}
						modal: {
							errors: {
								notEditable: {
									/**
									 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
									 */
									title: string
									/**
									 * I​ ​d​o​ ​n​o​t​ ​h​a​v​e​ ​t​h​e​ ​p​e​r​m​i​s​s​i​o​n​ ​t​o​ ​e​d​i​t​ ​t​h​e​ ​t​i​t​l​e​.
									 */
									description: string
								}
							}
							success: {
								/**
								 * T​i​c​k​e​t​ ​R​e​n​a​m​e​d
								 */
								title: string
								user: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​h​a​s​ ​b​e​e​n​ ​r​e​n​a​m​e​d​ ​f​r​o​m​ ​"​{​o​l​d​T​i​t​l​e​}​"​ ​t​o​ ​"​{​n​e​w​T​i​t​l​e​}​"​.
									 * @param {string} newTitle
									 * @param {string} oldTitle
									 */
									description: RequiredParams<'newTitle' | 'oldTitle'>
								}
								logs: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​a​t​ ​{​t​h​r​e​a​d​}​ ​h​a​s​ ​b​e​e​n​ ​r​e​n​a​m​e​d​ ​f​r​o​m​ ​"​{​o​l​d​T​i​t​l​e​}​"​ ​t​o​ ​"​{​n​e​w​T​i​t​l​e​}​"​.
									 * @param {string} newTitle
									 * @param {string} oldTitle
									 * @param {string} thread
									 */
									description: RequiredParams<'newTitle' | 'oldTitle' | 'thread'>
								}
							}
						}
					}
					lock: {
						builder: {
							/**
							 * L​o​c​k
							 */
							label: string
						}
						execute: {
							errors: {
								notManageable: {
									/**
									 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
									 */
									title: string
									/**
									 * I​ ​d​o​ ​n​o​t​ ​h​a​v​e​ ​t​h​e​ ​n​e​c​e​s​s​a​r​y​ ​p​e​r​m​i​s​s​i​o​n​(​s​)​ ​t​o​ ​l​o​c​k​ ​t​h​e​ ​c​h​a​n​n​e​l​.
									 */
									description: string
								}
							}
							success: {
								/**
								 * T​i​c​k​e​t​ ​L​o​c​k​e​d
								 */
								title: string
								user: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​h​a​s​ ​b​e​e​n​ ​s​u​c​c​e​s​s​f​u​l​l​y​ ​l​o​c​k​e​d​!
									 */
									description: string
								}
								logs: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​a​t​ ​{​t​h​r​e​a​d​}​ ​h​a​s​ ​b​e​e​n​ ​l​o​c​k​e​d​ ​b​y​ ​{​m​e​m​b​e​r​}​.
									 * @param {string} member
									 * @param {string} thread
									 */
									description: RequiredParams<'member' | 'thread'>
								}
							}
						}
					}
					lockAndClose: {
						builder: {
							/**
							 * L​o​c​k​ ​&​ ​C​l​o​s​e
							 */
							label: string
						}
						execute: {
							errors: {
								notManageableAndEditable: {
									/**
									 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
									 */
									title: string
									/**
									 * I​ ​d​o​ ​n​o​t​ ​h​a​v​e​ ​t​h​e​ ​n​e​c​e​s​s​a​r​y​ ​p​e​r​m​i​s​s​i​o​n​(​s​)​ ​t​o​ ​l​o​c​k​ ​a​n​d​ ​c​l​o​s​e​ ​t​h​e​ ​c​h​a​n​n​e​l​.
									 */
									description: string
								}
							}
							success: {
								/**
								 * T​i​c​k​e​t​ ​L​o​c​k​e​d​ ​&​ ​C​l​o​s​e​d
								 */
								title: string
								user: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​h​a​s​ ​b​e​e​n​ ​s​u​c​c​e​s​s​f​u​l​l​y​ ​l​o​c​k​e​d​ ​a​n​d​ ​c​l​o​s​e​d​!
									 */
									description: string
								}
								logs: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​a​t​ ​{​t​h​r​e​a​d​}​ ​h​a​s​ ​b​e​e​n​ ​l​o​c​k​e​d​ ​a​n​d​ ​c​l​o​s​e​d​ ​b​y​ ​{​m​e​m​b​e​r​}​.
									 * @param {string} member
									 * @param {string} thread
									 */
									description: RequiredParams<'member' | 'thread'>
								}
							}
						}
					}
					close: {
						builder: {
							/**
							 * C​l​o​s​e
							 */
							label: string
						}
						execute: {
							errors: {
								notEditable: {
									/**
									 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
									 */
									title: string
									/**
									 * I​ ​d​o​ ​n​o​t​ ​h​a​v​e​ ​t​h​e​ ​p​e​r​m​i​s​s​i​o​n​ ​t​o​ ​c​l​o​s​e​ ​t​h​e​ ​t​i​c​k​e​t​.
									 */
									description: string
								}
							}
							success: {
								/**
								 * T​i​c​k​e​t​ ​C​l​o​s​e​d
								 */
								title: string
								user: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​h​a​s​ ​b​e​e​n​ ​s​u​c​c​e​s​s​f​u​l​l​y​ ​c​l​o​s​e​d​!
									 */
									description: string
								}
								logs: {
									/**
									 * T​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​ ​a​t​ ​{​t​h​r​e​a​d​}​ ​h​a​s​ ​b​e​e​n​ ​c​l​o​s​e​d​ ​b​y​ ​{​m​e​m​b​e​r​}​.
									 * @param {string} member
									 * @param {string} thread
									 */
									description: RequiredParams<'member' | 'thread'>
								}
							}
						}
					}
					'delete': {
						builder: {
							/**
							 * D​e​l​e​t​e
							 */
							label: string
						}
						execute: {
							errors: {
								notManageable: {
									/**
									 * A​n​ ​E​r​r​o​r​ ​O​c​c​u​r​e​d
									 */
									title: string
									/**
									 * I​ ​d​o​ ​n​o​t​ ​h​a​v​e​ ​t​h​e​ ​n​e​c​e​s​s​a​r​y​ ​p​e​r​m​i​s​s​i​o​n​(​s​)​ ​t​o​ ​l​o​c​k​ ​t​h​e​ ​c​h​a​n​n​e​l​.
									 */
									description: string
								}
							}
							success: {
								user: {
									/**
									 * D​e​l​e​t​i​n​g​ ​T​i​c​k​e​t​.​.​.
									 */
									title: string
									/**
									 * I​ ​a​m​ ​a​t​t​e​m​p​t​i​n​g​ ​t​o​ ​d​e​l​e​t​e​ ​t​h​e​ ​s​u​p​p​o​r​t​ ​t​i​c​k​e​t​.​.​.
									 */
									description: string
								}
								logs: {
									/**
									 * T​i​c​k​e​t​ ​D​e​l​e​t​e​d
									 */
									title: string
									/**
									 * T​h​e​ ​t​i​c​k​e​t​ ​w​i​t​h​ ​t​h​e​ ​I​D​ ​{​t​h​r​e​a​d​I​d​}​ ​a​n​d​ ​t​i​t​l​e​ ​"​{​t​i​t​l​e​}​"​ ​h​a​s​ ​b​e​e​n​ ​d​e​l​e​t​e​d​ ​b​y​ ​{​m​e​m​b​e​r​}​.
									 * @param {string} member
									 * @param {string} threadId
									 * @param {string} title
									 */
									description: RequiredParams<'member' | 'threadId' | 'title'>
								}
							}
						}
					}
				}
				ticketState: {
					/**
					 * A​c​t​i​v​e
					 */
					active: string
					/**
					 * C​l​o​s​e​d
					 */
					archived: string
					/**
					 * L​o​c​k​e​d
					 */
					locked: string
					/**
					 * L​o​c​k​e​d​ ​a​n​d​ ​C​l​o​s​e​d
					 */
					lockedAndArchived: string
				}
			}
		}
	}
}

export type TranslationFunctions = {
	commands: {
		close: {
			data: {
				/**
				 * close
				 */
				name: () => LocalizedString
				/**
				 * Close/Archive the thread support ticket.
				 */
				description: () => LocalizedString
			}
		}
		'delete': {
			data: {
				/**
				 * delete
				 */
				name: () => LocalizedString
				/**
				 * Delete the thread support ticket.
				 */
				description: () => LocalizedString
			}
		}
		help: {
			data: {
				/**
				 * help
				 */
				name: () => LocalizedString
				/**
				 * View all available commands.
				 */
				description: () => LocalizedString
				options: {
					'0': {
						/**
						 * hidden
						 */
						name: () => LocalizedString
						/**
						 * Whether the message should be shown to you or everybody.
						 */
						description: () => LocalizedString
					}
				}
			}
			command: {
				embeds: {
					'0': {
						/**
						 * Command List
						 */
						title: () => LocalizedString
						/**
						 * Here is the list of the available commands: {commands}.
						 */
						description: (arg: { commands: string }) => LocalizedString
						fields: {
							'0': {
								/**
								 * 🔗 Links
								 */
								name: () => LocalizedString
								links: {
									/**
									 * Invite Link
									 */
									invite: () => LocalizedString
									/**
									 * Support Server
									 */
									supportServer: () => LocalizedString
								}
							}
						}
					}
				}
			}
		}
		lock: {
			data: {
				/**
				 * lock
				 */
				name: () => LocalizedString
				/**
				 * Lock the thread support ticket.
				 */
				description: () => LocalizedString
			}
		}
		migrate: {
			data: {
				/**
				 * migrate
				 */
				name: () => LocalizedString
				/**
				 * Deploy any database migrations that may be required.
				 */
				description: () => LocalizedString
			}
			command: {
				/**
				 * Successfully migrated the database!
				 */
				success: () => LocalizedString
			}
		}
		ping: {
			data: {
				/**
				 * ping
				 */
				name: () => LocalizedString
				/**
				 * View the latency and status of the bot.
				 */
				description: () => LocalizedString
			}
			command: {
				embeds: {
					'0': {
						/**
						 * Pinging...
						 */
						title: () => LocalizedString
					}
					'1': {
						/**
						 * Result
						 */
						title: () => LocalizedString
						fields: {
							'0': {
								/**
								 * Ping
								 */
								name: () => LocalizedString
								/**
								 * ⌛ {ms}ms
								 */
								value: (arg: { ms: number }) => LocalizedString
							}
							'1': {
								/**
								 * Latency
								 */
								name: () => LocalizedString
								/**
								 * 🏓 Roughly {ms}ms
								 */
								value: (arg: { ms: number }) => LocalizedString
							}
							'2': {
								/**
								 * WebSocket Status
								 */
								name: () => LocalizedString
								/**
								 * ⚙️ {status}
								 */
								value: (arg: { status: string }) => LocalizedString
							}
						}
					}
				}
			}
		}
		purge: {
			data: {
				/**
				 * purge
				 */
				name: () => LocalizedString
				/**
				 * Remove the latest messages in the current channel by the specified amount.
				 */
				description: () => LocalizedString
				options: {
					'0': {
						/**
						 * amount
						 */
						name: () => LocalizedString
						/**
						 * The amount of messages to delete.
						 */
						description: () => LocalizedString
					}
				}
			}
			command: {
				embeds: {
					'0': {
						/**
						 * Purged Messages
						 */
						title: () => LocalizedString
						/**
						 * Successfully deleted the last {amount} messages!
						 */
						description: (arg: { amount: number }) => LocalizedString
					}
				}
			}
		}
		'rename-title': {
			data: {
				/**
				 * rename-title
				 */
				name: () => LocalizedString
				/**
				 * Rename the title of the thread support ticket.
				 */
				description: () => LocalizedString
			}
		}
		'show-tickets': {
			data: {
				/**
				 * show-tickets
				 */
				name: () => LocalizedString
				/**
				 * Show the tickets you have in the server.
				 */
				description: () => LocalizedString
				options: {
					'0': {
						/**
						 * state
						 */
						name: () => LocalizedString
						/**
						 * Filter by the tickets' states.
						 */
						description: () => LocalizedString
					}
				}
			}
			command: {
				buttons: {
					previous: {
						/**
						 * Previous Page
						 */
						label: () => LocalizedString
					}
					next: {
						/**
						 * Next Page
						 */
						label: () => LocalizedString
					}
				}
				/**
				 * Total amount of tickets by you in the server: {amount}.
				 */
				content: (arg: { amount: number }) => LocalizedString
				embeds: {
					'0': {
						fields: {
							'0': {
								/**
								 * Thread Channel
								 */
								name: () => LocalizedString
							}
							'1': {
								/**
								 * State
								 */
								name: () => LocalizedString
							}
						}
					}
				}
			}
		}
		ticket: {
			data: {
				/**
				 * ticket
				 */
				name: () => LocalizedString
				/**
				 * Create a support ticket within a category.
				 */
				description: () => LocalizedString
			}
		}
	}
	events: {
		interactionCreate: {
			ownerOnly: {
				/**
				 * You need to be the owner of the bot to run this command!
				 */
				error: () => LocalizedString
			}
		}
		guildMemberAdd: {
			welcome: {
				/**
				 * Welcome {member}!
				 */
				title: (arg: { member: string }) => LocalizedString
				/**
				 * {member} Thank you for joining the server!
				 */
				message: (arg: { member: string }) => LocalizedString
			}
			farewell: {
				/**
				 * Goodbye {member}!
				 */
				title: (arg: { member: string }) => LocalizedString
				/**
				 * {member} has left the server.
				 */
				message: (arg: { member: string }) => LocalizedString
			}
		}
	}
	tickets: {
		threads: {
			categories: {
				configuration: {
					openingMessage: {
						/**
						 * {category}: New Support Ticket
						 */
						title: (arg: { category: string }) => LocalizedString
						/**
						 * {member} created a new support ticket in the {category} category!
						 */
						description: (arg: { category: string, member: string }) => LocalizedString
					}
				}
				categoryList: {
					/**
					 * Select a category to create a ticket within.
					 */
					placeholder: () => LocalizedString
				}
				createModal: {
					errors: {
						invalidCustomId: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * The custom ID could not be found.
							 */
							description: () => LocalizedString
						}
					}
					title: {
						/**
						 * Title
						 */
						label: () => LocalizedString
						/**
						 * Write a title to be used in the ticket.
						 */
						placeholder: () => LocalizedString
					}
					description: {
						/**
						 * Description
						 */
						label: () => LocalizedString
						/**
						 * Write a description to be used in the ticket.
						 */
						placeholder: () => LocalizedString
					}
					/**
					 * Ticket Title & Description
					 */
					modalTitle: () => LocalizedString
				}
				createTicket: {
					errors: {
						invalidUser: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * A ticket for myself cannot be created, you silly.
							 */
							description: () => LocalizedString
						}
						noCategories: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * No ticket categories could be found.
							 */
							description: () => LocalizedString
						}
						invalidId: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * The category ID is not valid.
							 */
							description: () => LocalizedString
						}
						noConfiguration: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * The global or category configuration could not be found.
							 */
							description: () => LocalizedString
						}
						noManagers: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * There are no managers to add to the support ticket.
							 */
							description: () => LocalizedString
						}
						invalidChannel: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * The ticket channel does not exist or is not a text channel.
							 */
							description: () => LocalizedString
						}
						noPermissions: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							/**
							 * I don't have the required permissions in the channel to create a ticket: {permissions}.
							 */
							description: (arg: { permissions: string }) => LocalizedString
						}
						tooManyTickets: {
							/**
							 * An Error Occured
							 */
							title: () => LocalizedString
							user: {
								/**
								 * You have too many active tickets, you may not have more than {amount}.
								 */
								description: (arg: { amount: number }) => LocalizedString
							}
							proxy: {
								/**
								 * {member} has too many active tickets, they may not have more than {amount}.
								 */
								description: (arg: { amount: number, member: string }) => LocalizedString
							}
						}
					}
					ticketCreated: {
						/**
						 * Ticket Created!
						 */
						title: () => LocalizedString
						notProxy: {
							user: {
								/**
								 * Your support ticket has been created! View it at {channel}.
								 */
								description: (arg: { channel: string }) => LocalizedString
							}
							logs: {
								/**
								 * {member} has created a ticket! View it at {channel}.
								 */
								description: (arg: { channel: string, member: string }) => LocalizedString
							}
						}
						proxy: {
							user: {
								/**
								 * The support ticket for {member} has been created! View it at {channel}.
								 */
								description: (arg: { channel: string, member: string }) => LocalizedString
							}
							logs: {
								/**
								 * {creator} created a support ticket by proxy for {member}! View it at {channel}.
								 */
								description: (arg: { channel: string, creator: string, member: string }) => LocalizedString
							}
						}
					}
				}
				buttons: {
					_errorIfNotTicketChannel: {
						/**
						 * An Error Occured
						 */
						title: () => LocalizedString
						/**
						 * The channel is not a valid ticket channel.
						 */
						description: () => LocalizedString
					}
					_errorIfNotTicketAuthorOrManager: {
						/**
						 * An Error Occured
						 */
						title: () => LocalizedString
						/**
						 * You need to be the ticket author or manager to execute this button/command.
						 */
						description: () => LocalizedString
					}
					renameTitle: {
						builder: {
							/**
							 * Rename Title
							 */
							label: () => LocalizedString
						}
						component: {
							modal: {
								/**
								 * Rename Thread Title
								 */
								title: () => LocalizedString
								inputs: {
									'0': {
										/**
										 * Thread Title
										 */
										label: () => LocalizedString
										/**
										 * Write the new title that should be used for the thread.
										 */
										placeholder: () => LocalizedString
									}
								}
							}
						}
						modal: {
							errors: {
								notEditable: {
									/**
									 * An Error Occured
									 */
									title: () => LocalizedString
									/**
									 * I do not have the permission to edit the title.
									 */
									description: () => LocalizedString
								}
							}
							success: {
								/**
								 * Ticket Renamed
								 */
								title: () => LocalizedString
								user: {
									/**
									 * The support ticket has been renamed from "{oldTitle}" to "{newTitle}".
									 */
									description: (arg: { newTitle: string, oldTitle: string }) => LocalizedString
								}
								logs: {
									/**
									 * The support ticket at {thread} has been renamed from "{oldTitle}" to "{newTitle}".
									 */
									description: (arg: { newTitle: string, oldTitle: string, thread: string }) => LocalizedString
								}
							}
						}
					}
					lock: {
						builder: {
							/**
							 * Lock
							 */
							label: () => LocalizedString
						}
						execute: {
							errors: {
								notManageable: {
									/**
									 * An Error Occured
									 */
									title: () => LocalizedString
									/**
									 * I do not have the necessary permission(s) to lock the channel.
									 */
									description: () => LocalizedString
								}
							}
							success: {
								/**
								 * Ticket Locked
								 */
								title: () => LocalizedString
								user: {
									/**
									 * The support ticket has been successfully locked!
									 */
									description: () => LocalizedString
								}
								logs: {
									/**
									 * The support ticket at {thread} has been locked by {member}.
									 */
									description: (arg: { member: string, thread: string }) => LocalizedString
								}
							}
						}
					}
					lockAndClose: {
						builder: {
							/**
							 * Lock & Close
							 */
							label: () => LocalizedString
						}
						execute: {
							errors: {
								notManageableAndEditable: {
									/**
									 * An Error Occured
									 */
									title: () => LocalizedString
									/**
									 * I do not have the necessary permission(s) to lock and close the channel.
									 */
									description: () => LocalizedString
								}
							}
							success: {
								/**
								 * Ticket Locked & Closed
								 */
								title: () => LocalizedString
								user: {
									/**
									 * The support ticket has been successfully locked and closed!
									 */
									description: () => LocalizedString
								}
								logs: {
									/**
									 * The support ticket at {thread} has been locked and closed by {member}.
									 */
									description: (arg: { member: string, thread: string }) => LocalizedString
								}
							}
						}
					}
					close: {
						builder: {
							/**
							 * Close
							 */
							label: () => LocalizedString
						}
						execute: {
							errors: {
								notEditable: {
									/**
									 * An Error Occured
									 */
									title: () => LocalizedString
									/**
									 * I do not have the permission to close the ticket.
									 */
									description: () => LocalizedString
								}
							}
							success: {
								/**
								 * Ticket Closed
								 */
								title: () => LocalizedString
								user: {
									/**
									 * The support ticket has been successfully closed!
									 */
									description: () => LocalizedString
								}
								logs: {
									/**
									 * The support ticket at {thread} has been closed by {member}.
									 */
									description: (arg: { member: string, thread: string }) => LocalizedString
								}
							}
						}
					}
					'delete': {
						builder: {
							/**
							 * Delete
							 */
							label: () => LocalizedString
						}
						execute: {
							errors: {
								notManageable: {
									/**
									 * An Error Occured
									 */
									title: () => LocalizedString
									/**
									 * I do not have the necessary permission(s) to lock the channel.
									 */
									description: () => LocalizedString
								}
							}
							success: {
								user: {
									/**
									 * Deleting Ticket...
									 */
									title: () => LocalizedString
									/**
									 * I am attempting to delete the support ticket...
									 */
									description: () => LocalizedString
								}
								logs: {
									/**
									 * Ticket Deleted
									 */
									title: () => LocalizedString
									/**
									 * The ticket with the ID {threadId} and title "{title}" has been deleted by {member}.
									 */
									description: (arg: { member: string, threadId: string, title: string }) => LocalizedString
								}
							}
						}
					}
				}
				ticketState: {
					/**
					 * Active
					 */
					active: () => LocalizedString
					/**
					 * Closed
					 */
					archived: () => LocalizedString
					/**
					 * Locked
					 */
					locked: () => LocalizedString
					/**
					 * Locked and Closed
					 */
					lockedAndArchived: () => LocalizedString
				}
			}
		}
	}
}

export type Formatters = {}
