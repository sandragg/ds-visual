import {
	Point,
	PromiseDefer,
	PromiseWithStatus,
	PromiseCallback
} from 'src/services/interface';
import { PromiseStatus } from 'src/services/constants';
import { HashMap } from 'react-move';

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
export function getNodeCenterPoint({ x, y }: Point): Point { // function probably will be removed
	return {
		x,
		y
	}
}

/**
 * Get element from passed container by id.
 * @param container
 * @param id
 */
export function getById(container: any[], id: number): any {
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
