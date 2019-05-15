import {
	AnimationHistoryStep,
	ElementAnimationStep, ElementViewModel,
	HistoryStep,
	Point,
	PromiseCallback,
	PromiseDefer,
	PromiseWithStatus,
} from 'src/services/interface';
import { BulkType, PromiseStatus, TrackedActions } from 'src/services/constants';
import { HashMap } from 'react-move';
import { AnimationBuildOptions } from 'src/utils/utils.interface';
import { AnimationHistory } from 'src/services/animation-history';

/**
 * Wrapper extends the promise with the current status property.
 * @param promise
 */
export function StatusPromise(promise: Promise<any>): PromiseWithStatus<any> {
	const extended = promise as PromiseWithStatus<any>;
	extended.status = PromiseStatus.pending;
	extended.then(() => extended.status = PromiseStatus.resolved)
			.catch(() => extended.status = PromiseStatus.rejected);

	return extended;
}

/**
 *  Create a deferred promise.
 */
export function defer(cb?: PromiseCallback): PromiseDefer {
	const deferred: any = {};

	deferred.promise = StatusPromise(new Promise(
	(resolve, reject) => {
			deferred.resolve = resolve;
			deferred.reject = reject;

			if (typeof cb === 'function') {
				cb(resolve, reject);
			}
		}
	));

	return deferred;
}

export function calcTransformValue(attrs: any): string {
	const transformAttrs = [ 'translate', 'scale', 'rotate' ];
	let transformValue: string = '';

	transformAttrs.forEach(attr => {
		const value = attrs[attr];
		if (value) {
			transformValue += `${attr}(${value})`;
		}
	});

	return transformValue;
}

/**
 * Calculate node center point.
 * @param x Node top left corner
 * @param y Node top left corner
 */
export function getNodeCenterPoint({ x, y }: Point, [width, height]: [number, number]): Point { // function probably will be removed
	return {
		x: x - width / 2,
		y: y - height / 2
	}
}

/**
 * Get element from passed container by id.
 * @param container
 * @param id
 */
export function getById<T = {}>(container: any[], id: number | string): T {
	return container.find(elem => elem.id === id);
}


export function areObjectsEqual(obj1, obj2): boolean {
	if (obj1 === obj2) {
		return true;
	}

	const obj1Keys = Object.keys(obj1);
	const obj2Keys = Object.keys(obj2);

	return obj1Keys.length === obj2Keys.length && obj1Keys.every(key => Object.is(obj1[key], obj2[key]));
}

export function filterElementAttrs(attrs: HashMap, prevAttrs: boolean): HashMap {
	let value;

	return Object.keys(attrs).reduce(
			(res, key) => {
				value = attrs[key];

				if (Array.isArray(value)) {
					res[key] = value[prevAttrs ? 0 : 1];
				} else if (!prevAttrs) {
					res[key] = value;
				}

				return res;
			},
			{}
	);
}

const buildRules = {
	skipAttrs: TrackedActions.select | TrackedActions.delete,
	onlyPreviousState: TrackedActions.new | TrackedActions.delete,
	bulk: BulkType.partial | BulkType.all
};

export function buildAnimationStep(options: AnimationBuildOptions) {
	let {
		getElementViewModelById,
		rule: checkRule,
		extendStep,
		calculateByAttrs: calculate
	} = options;
	const lastState = {};
	const memoGetElementViewModelById = memo(getElementViewModelById);

	typeof checkRule !== 'function' && (checkRule = null);
	typeof extendStep !== 'function' && (extendStep = null);

	return (step: HistoryStep, animationTrace: AnimationHistory): AnimationHistoryStep[] => {
		const steps: AnimationHistoryStep[] = [];
		if (checkRule && !checkRule(step)) {
			return steps;
		}

		const { id, opts, attrs } = step;
		const { history } = animationTrace;

		if (attrs[id] && buildRules.bulk & attrs[id].bulkType) {
			return extendStep ? [extendStep(step)] : [];
		}

		const itemVM: ElementViewModel = memoGetElementViewModelById(step);
		const { id: itemVmId, ref } = itemVM;
		const isChange = opts === TrackedActions.change;
		const emptyAttrs = {};
		let prevStateIndex = itemVmId in lastState ? lastState[itemVmId] : null;

		if (prevStateIndex === null) {
			const onlyPrevState = buildRules.onlyPreviousState & opts;
			const animationAttrs = buildRules.skipAttrs & opts
				? emptyAttrs
				: calculate(id, isChange ? filterElementAttrs(attrs, true) : attrs, animationTrace);

			steps.push({
				id: itemVmId,
				ref,
				action: onlyPrevState ? opts : TrackedActions.default,
				attrs: animationAttrs,
				previousState: prevStateIndex
			});
			lastState[itemVmId] = prevStateIndex = history.length;

			if (onlyPrevState) {
				extendStep && composeWithLastStep(steps, extendStep(step, itemVM));
				return steps;
			}
		}
		else if (isChange) {
			let prevState = history[prevStateIndex] as ElementAnimationStep;
			if (Array.isArray(prevState)) {
				prevState = getById(prevState, itemVmId);
			}

			prevState.attrs = calculate(id, {
				...prevState.attrs,
				...filterElementAttrs(attrs, true)
			}, animationTrace);
		}

		steps.push({
			id: itemVmId,
			ref,
			action: opts,
			attrs: calculate(id, isChange ? filterElementAttrs(attrs, false) : attrs, animationTrace),
			previousState: prevStateIndex
		});
		extendStep && composeWithLastStep(steps, extendStep(step, itemVM));

		lastState[itemVmId] = steps.length === 1 ? history.length : ++prevStateIndex;

		return steps;
	};
}


function memo(func: Function): Function {
	const cache = {};

	return (param: HistoryStep) => (
		param.id in cache
			? cache[param.id]
			: cache[param.id] = func(param)
	);
}

function composeWithLastStep(steps: AnimationHistoryStep[], extension: ElementAnimationStep[]): AnimationHistoryStep[] {
	if (extension.length) {
		const lastStep = steps.pop();
		steps.push(extension.concat(lastStep));
	}

	return steps;
}