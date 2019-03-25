/**
 * Tracked actions.
 */
export const enum TrackedActions {
	'default',
	'select',
	'new',
	'delete',
	'change'
}
/**
 * Promise statuses.
 */
export const PROMISE_STATUSES = {
	PENDING: 'pending',
	RESOLVED: 'resolved',
	REJECTED: 'rejected'
};

export const enum Direction {
	'vertical',
	'horizontal'
}

export const enum FieldType {
	'value',
	'ref'
}

export const FieldHeight = 30;

export const FieldWidth = {
	[FieldType.value]: 40,
	[FieldType.ref]: 20
};
