import {
	ArrowParams,
	Point,
	CallbackFunction,
	PromiseDefer
} from './interface';

/* Defer Promise */
export function defer(): PromiseDefer {
	const deferred: any = {};

	deferred.promise = new Promise((resolve: CallbackFunction, reject: CallbackFunction) => {
		deferred.resolve = resolve;
		deferred.reject = reject;
	});

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
	return [1, 0, 0, 1, point.x, point.y];
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
