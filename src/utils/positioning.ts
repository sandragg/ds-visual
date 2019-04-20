import {
	ArrowParams,
	NodeFactory,
	Point
} from 'src/services/interface';
import {
	CursorOptions,
	Position,
	Direction,
	FieldType
} from 'src/services/constants';

export function getDirectionByPosition(position: Position): Direction {
	switch (position) {
		case Position.top:
		case Position.bottom:
			return Direction.vertical;
		case Position.left:
		case Position.right:
			return Direction.horizontal;
	}
}

export function getReversePosition(position: Position): Position {
	switch (position) {
		case Position.top:
			return Position.bottom;
		case Position.bottom:
			return Position.top;
		case Position.left:
			return Position.right;
		case Position.right:
			return Position.left;
	}
}

export function calculatePointByOffsetPosition(point: Point, position: Position, offset: number): Point {
	const isVertical = position === Position.top || position === Position.bottom;
	const k = position === Position.top || position === Position.left ? -1 : 1;
	const offsetPoint = { ...point };

	offsetPoint[isVertical ? 'y' : 'x'] += k * offset;

	return offsetPoint;
}

export function calculateCursorCoords(Node: NodeFactory,
                                      index: number,
                                      position: Position = Position.top): [Point, Point] {
	let isVertical = getDirectionByPosition(Node.sequencePosition) === Direction.vertical;
	const inNodeCoords = index >= 0 ? Node.getNodeCoords(index) : (
		calculatePointByOffsetPosition(
			{ x: 0, y: 0 },
			getReversePosition(Node.sequencePosition),
			isVertical ? Node.height : Node.width
		)
	);

	isVertical = getDirectionByPosition(position) === Direction.vertical;
	const nodeHalfWidth = Node.width / 2;
	const nodeHalfHeight = Node.height / 2;
	const offset = CursorOptions.offset + (isVertical ? nodeHalfHeight : nodeHalfWidth);

	const centerPoint: Point = {
		x: inNodeCoords.x + nodeHalfWidth,
		y: inNodeCoords.y + nodeHalfHeight
	};
	const inPoint = calculatePointByOffsetPosition(centerPoint, position, offset);
	const outPoint = calculatePointByOffsetPosition(inPoint, position, CursorOptions.length);

	return [ outPoint, inPoint ];
}

export function calculateLinkCoords(Node: NodeFactory,
                                    outNodeIndex: number,
                                    outNodeFieldKey: string,
                                    inNodeIndex: number | null): [Point, Point] {
	if (outNodeIndex < 0) {
		throw new Error('Link arrow out node index should be >= 0');
	}
	const outCoords = Node.getFieldCoords(outNodeIndex, outNodeFieldKey);
	const fieldSize = Node.getFieldSize(FieldType.ref);
	outCoords.x += fieldSize[0] / 2;
	outCoords.y += fieldSize[1] / 2;

	// Currently arrow entry point is a left top corner of the node.
	// TODO Need to compute the nearest point of the node to the arrow.
	const inCoords = Node.getNodeCoords(inNodeIndex);

	return [ outCoords, inCoords ];
}

/* TODO check radians */
export function calculateArrowMatrix(outPoint: Point, inPoint: Point): ArrowParams {
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

export function calculateNodeMatrix(point: Point): number[] {
	return [1, 0, 0, 1, point.x || 0, point.y || 0];
}
