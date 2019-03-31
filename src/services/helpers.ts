import {
	ArrowParams,
	Point,
	CallbackFunction,
	PromiseDefer,
	AnimatedNode,
	PromiseStatus
} from './interface';
import {
	NODE_OPTIONS,
	PROMISE_STATUSES
} from './constants';

/**
 * Wrapper extends the promise with the current status property.
 * @param promise
 */
export function StatusPromise(promise: Promise<any>): PromiseStatus<any> {
	const extended: any = promise;
	extended.status = PROMISE_STATUSES.PENDING;
	extended.then(() => extended.status = PROMISE_STATUSES.RESOLVED)
			.catch(() => extended.status = PROMISE_STATUSES.REJECTED);

	return extended;
}

/**
 *  Create a deferred promise.
 */
export function defer(): PromiseDefer {
	const deferred: any = {};

	deferred.promise = new Promise(
	(resolve: CallbackFunction, reject: CallbackFunction) => {
			deferred.resolve = resolve;
			deferred.reject = reject;
		}
	);

	return deferred;
}

/**
 * Animate queue nodes consistently.
 * @param queue
 */
export function animateQueue(queue: AnimatedNode[]): PromiseDefer {
	const deferred: any = defer();
	deferred.promise = StatusPromise(deferred.promise);

	const queuePromise: Promise<any> = new Promise(
			async (resolve: CallbackFunction, reject: CallbackFunction) => {
			for (const { ref, animationAttrs } of queue) {
				if (deferred.promise.status === PROMISE_STATUSES.REJECTED) {
					reject();
				}
				ref.current && await ref.current.animate(animationAttrs);
			}
			deferred.resolve();
		}
	);

	return deferred;
}

/* TODO check radians */
export function calcArrowMatrix(outPoint: Point, inPoint: Point): ArrowParams {
	const cathetusLength: Point = {
		x: Math.abs(inPoint.x - outPoint.x),
		y: Math.abs(inPoint.y - outPoint.y)
	};
	/* Calculate an arrow length (hypotenuse) via Pythagorean theorem
	 * and find which quadrant the arrow is located in.
	*/
	const hypotenuse: number = (cathetusLength.x ** 2 + cathetusLength.y ** 2) ** 0.5;
	const rightQuadrants: boolean = inPoint.x > outPoint.x;
	const topQuadrants: boolean = inPoint.y > outPoint.y;

	const quadrantSinAlfa: number = (rightQuadrants ? cathetusLength.y : cathetusLength.x) / hypotenuse;
	let radianAlfa: number = Math.asin(quadrantSinAlfa);

	if (!rightQuadrants) {
		radianAlfa += Math.PI / 2;
	}
	if (!topQuadrants) {
		radianAlfa = 2 * Math.PI - radianAlfa;
	}

	const sinA: number = Math.sin(radianAlfa);
	const cosA: number = Math.cos(radianAlfa);
	const matrix: number[] = [
		cosA,       // a
		sinA,       // b
		-sinA,      // c
		cosA,       // d
		outPoint.x, // e
		outPoint.y  // f
	];

	return {
		matrix,
		length: hypotenuse
	}
}

export function calcNodeMatrix(point: Point): number[] {
	return [1, 0, 0, 1, point.x || 0, point.y || 0];
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
export function getNodeCenterPoint({ x, y }: Point): Point {
	return {
		x: x + NODE_OPTIONS.WIDTH / 2,
		y: y + NODE_OPTIONS.HEIGHT / 2
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
