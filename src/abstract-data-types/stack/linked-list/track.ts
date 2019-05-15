import { TrackedClassItem } from 'src/services/interface';
import { TrackedActions } from 'src/services/constants';

/**
 * Model tracked properties (fields and methods).
 */
export const trackedProps: TrackedClassItem[] = [
	['head', TrackedActions.select],
	['delete', TrackedActions.delete],
	'Element'
];

export const propertyKeyMatchesId: PropertyKey[] = ['head'];
