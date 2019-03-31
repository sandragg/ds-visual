import React, { HTMLAttributes, RefObject, SVGAttributes, useMemo } from 'react';
import { calcArrowMatrix } from 'src/services/helpers';
import { ArrowParams, Point } from 'src/services/interface';
import { ArrowType } from 'src/services/constants';
import './arrow.css';

interface Props extends HTMLAttributes<HTMLElement> {
	nodeRef?: RefObject<SVGPathElement>,
	attrs?: SVGAttributes<SVGElement>
	outPoint: Point,
	inPoint: Point,
	type: ArrowType
}

const ARROW_TAIL_OPTIONS = {
	WIDTH: 8,
	HEIGHT: 8
};

export const Arrow = ({ nodeRef, attrs, outPoint, inPoint, type }: Props) => {
	const { transform, ...props } = attrs;
	const { matrix, length }: ArrowParams = useMemo(
	() => calcArrowMatrix(outPoint, inPoint),
	[outPoint, inPoint]
	);
	const path: string = type === ArrowType.cursor
			? defineCursorArrowPath(length)
			: defineLinkArrowPath(length);

	return (
		<path
			ref={nodeRef}
			className="arrow"
			transform={transform || `matrix(${matrix})`}
			d={path}
			{...props}
		/>
	)
};

function defineLinkArrowPath(length: number): string {
	const tailsCenter = (length + ARROW_TAIL_OPTIONS.WIDTH) / 2;

	return (
		`
      M 0 0
      H ${tailsCenter}
      M ${tailsCenter} 0
      L ${tailsCenter - ARROW_TAIL_OPTIONS.HEIGHT} ${ARROW_TAIL_OPTIONS.WIDTH / 2}
      L ${tailsCenter - 6} 0
      L ${tailsCenter - ARROW_TAIL_OPTIONS.HEIGHT} -${ARROW_TAIL_OPTIONS.WIDTH / 2}
      L ${tailsCenter} 0
      H ${length}
    `
	);
}

function defineCursorArrowPath(length: number): string {
	return (
		`
			M 0 0
			H ${length}
			L ${length - ARROW_TAIL_OPTIONS.HEIGHT} ${ARROW_TAIL_OPTIONS.WIDTH / 2}
      L ${length - 6} 0
      L ${length - ARROW_TAIL_OPTIONS.HEIGHT} -${ARROW_TAIL_OPTIONS.WIDTH / 2}
      L ${length} 0
		`
	);
}
