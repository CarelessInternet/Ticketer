import { describe, expect, test } from 'bun:test';
import { customId, dynamicCustomId, extractCustomId } from '../src';

describe('Custom ID Functionality', () => {
	test('Create a custom ID with no dynamic value.', () => {
		expect(customId('test_1-2{3}')).toStrictEqual('test_1-2{3}');
	});

	test('Create a custom ID with a dynamic value.', () => {
		expect(customId('test_1-2{3}', 'justLike_123')).toStrictEqual('{justLike_123}_test_1-2{3}');
	});

	test('Create a custom ID with a complex dynamic value.', () => {
		expect(customId('test_1-2{3}', '{(€4)]5}_-}6,1')).toStrictEqual('{{(€4)]5}_-}6,1}_test_1-2{3}');
	});

	test('Create a dynamic custom ID.', () => {
		expect(dynamicCustomId("that's not me")).toStrictEqual("{dynamic}_that's not me");
		expect(dynamicCustomId('dem_boy_not_ready_yet')).toStrictEqual('{dynamic}_dem_boy_not_ready_yet');
	});

	test('Extract a custom ID with no dynamic value and without the required argument.', () => {
		expect(extractCustomId('guns in the air')).toStrictEqual({
			customId: 'guns in the air',
		});
	});

	test('Extract a custom ID with no dynamic value and with the required argument set to false.', () => {
		expect(extractCustomId("{feds_ on the case but we don't care", false)).toStrictEqual({
			customId: "{feds_ on the case but we don't care",
		});
	});

	test('Extract a custom ID with no dynamic value and with the required argument set to true.', () => {
		expect(extractCustomId('{rifle}}, uzi, everything there', true)).toStrictEqual({
			customId: '{rifle}}, uzi, everything there',
			// @ts-expect-error: This should be undefined.
			dynamicValue: undefined,
		});
	});

	test('Extract a custom ID with a dynamic value and without the required argument.', () => {
		expect(extractCustomId('{and_I}_got a shotgun spare')).toStrictEqual({
			customId: '{dynamic}_got a shotgun spare',
			dynamicValue: 'and_I',
		});
	});

	test('Extract a custom ID with a dynamic value and with the required argument set to false.', () => {
		expect(extractCustomId("{leave}_man where, Raskit's lair", false)).toStrictEqual({
			customId: "{dynamic}_man where, Raskit's lair",
			dynamicValue: 'leave',
		});
	});

	test('Extract a custom ID with a dynamic value and with the required argument set to true.', () => {
		expect(extractCustomId('{eat}_MCs like a grizzly bear', true)).toStrictEqual({
			customId: '{dynamic}_MCs like a grizzly bear',
			dynamicValue: 'eat',
		});
	});
});
