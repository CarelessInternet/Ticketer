import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Base, Client } from '../src';

describe('Custom ID Functionality', () => {
	// @ts-expect-error: There is no need to implement the execute function here.
	class Example extends Base {
		public customId = super.customId;
		public dynamicCustomId = super.dynamicCustomId;
		public extractCustomId = super.extractCustomId;
	}

	const instance = new Example(new Client({ intents: [] }));

	it('Create a custom ID with no dynamic value.', () => {
		strictEqual(instance.customId('test_1-2{3}'), 'test_1-2{3}');
	});

	it('Create a custom ID with a dynamic value.', () => {
		strictEqual(instance.customId('test_1-2{3}', 'justLike_123'), '{justLike_123}_test_1-2{3}');
	});

	it('Create a custom ID with a complex dynamic value.', () => {
		strictEqual(instance.customId('test_1-2{3}', '{(€4)]5}_-}6,1'), '{{(€4)]5}_-}6,1}_test_1-2{3}');
	});

	it('Create a dynamic custom ID.', () => {
		strictEqual(instance.dynamicCustomId("that's not me"), "{dynamic}_that's not me");
		strictEqual(instance.dynamicCustomId('dem_boy_not_ready_yet'), '{dynamic}_dem_boy_not_ready_yet');
	});

	it('Extract a custom ID with no dynamic value and without the required argument.', () => {
		deepStrictEqual(instance.extractCustomId('guns in the air'), {
			customId: 'guns in the air',
		});
	});

	it('Extract a custom ID with no dynamic value and with the required argument set to false.', () => {
		deepStrictEqual(instance.extractCustomId("{feds_ on the case but we don't care", false), {
			customId: "{feds_ on the case but we don't care",
		});
	});

	it('Extract a custom ID with no dynamic value and with the required argument set to true.', () => {
		deepStrictEqual(instance.extractCustomId('{rifle}}, uzi, everything there', true), {
			customId: '{rifle}}, uzi, everything there',
			dynamicValue: undefined,
		});
	});

	it('Extract a custom ID with a dynamic value and without the required argument.', () => {
		deepStrictEqual(instance.extractCustomId('{and_I}_got a shotgun spare'), {
			customId: '{dynamic}_got a shotgun spare',
			dynamicValue: 'and_I',
		});
	});

	it('Extract a custom ID with a dynamic value and with the required argument set to false.', () => {
		deepStrictEqual(instance.extractCustomId("{leave}_man where, Raskit's lair", false), {
			customId: "{dynamic}_man where, Raskit's lair",
			dynamicValue: 'leave',
		});
	});

	it('Extract a custom ID with a dynamic value and with the required argument set to true.', () => {
		deepStrictEqual(instance.extractCustomId('{eat}_MCs like a grizzly bear', true), {
			customId: '{dynamic}_MCs like a grizzly bear',
			dynamicValue: 'eat',
		});
	});
});
