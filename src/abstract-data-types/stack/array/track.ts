import { TrackedClassItem } from 'src/services/interface';
import { TrackedActions } from 'src/services/constants';

/**
 * Model tracked properties (fields and methods).
 */
export const trackedProps: TrackedClassItem[] = [
	['up', TrackedActions.select],
	['stack', TrackedActions.select]
];
