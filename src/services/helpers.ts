import { Point } from './interface';

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
