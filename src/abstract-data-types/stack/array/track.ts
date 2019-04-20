import { Trace, TrackedClassItem } from 'src/services/interface';
import { TrackedActions } from 'src/services/constants';
import { areObjectsEqual } from 'src/utils/animation';

/**
 * Model tracked properties (fields and methods).
 */
const trackedProps: TrackedClassItem[] = [
	['up', TrackedActions.select],
	['stack', TrackedActions.select]
];

/**
 * Handler for history build. Called for each access to the tracked property.
 * @param trace History
 * @param result Action result
 * @param args Passed arguments
 * @param [prop, action] Tracked property
 * @param prevResult Previous value for mutating action (optional)
 */
const onTrack = (trace: Trace) => (result: any,
                                   args: any[],
                                   [prop, action]: TrackedClassItem,
                                   prevResult?: any): void => {
	if (!trace.isUpdating) {
		return;
	}

	const prevStep = trace.history.top();
	const isChanged = prevResult !== undefined;
	let id;
	let opts;
	let attrs;

	if (prop === 'up') {
		id = prop;
		opts = isChanged ? TrackedActions.change : TrackedActions.select;
		attrs = { 'up': isChanged ? [prevResult, result] : result };
	}
	else {
		id = Number(args[0]);
		opts = isChanged ? TrackedActions.change : TrackedActions.select;
		attrs = isChanged ? { 'value': [prevResult || '', result] } : {};
	}

	if (
			!prevStep
			|| prevStep.id !== id
			|| prevStep.opts !== opts
			|| !areObjectsEqual(prevStep.attrs, attrs)
	) {
		trace.history.push({ id, opts, attrs });
	}
};

export {
	trackedProps,
	onTrack
}
