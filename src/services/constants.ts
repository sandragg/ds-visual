/**
 * Tracked actions.
 */
export const TRACKED_ACTIONS = {
	'DEFAULT': 'default',
	'SELECT': 'active',
	'INSERT': 'inserted',
	'REMOVE': 'removed'
};
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
