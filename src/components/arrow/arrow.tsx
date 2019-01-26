import React, {
	useMemo,
	RefObject,
	HTMLAttributes,
	SVGAttributes
} from 'react';
import { calcArrowMatrix } from 'src/services/helpers';
import { Point, ArrowParams } from 'src/services/interface';

interface Props extends HTMLAttributes<HTMLElement> {
	nodeRef?: RefObject<SVGPathElement>,
	attrs?: SVGAttributes<SVGElement>
	outPoint: Point,
	inPoint: Point
}

const ARROW_TAIL_OPTIONS = {
	WIDTH: 8,
	HEIGHT: 8
};

export const Arrow = ({ nodeRef, attrs, outPoint, inPoint }: Props) => {
	const { transform, ...props } = attrs;
	const { matrix, length }: ArrowParams = useMemo(
	() => calcArrowMatrix(outPoint, inPoint),
	[outPoint, inPoint]
	);
	const tailsCenter = (length + ARROW_TAIL_OPTIONS.WIDTH) / 2;

	return (
		<path
			ref={nodeRef}
			className="arrow"
			transform={transform || `matrix(${matrix})`}
			d={`
	      M 0 0
	      H ${tailsCenter}
	      M ${tailsCenter} 0
	      L ${tailsCenter - ARROW_TAIL_OPTIONS.HEIGHT} ${ARROW_TAIL_OPTIONS.WIDTH / 2}
	      L ${tailsCenter - 6} 0
	      L ${tailsCenter - ARROW_TAIL_OPTIONS.HEIGHT} -${ARROW_TAIL_OPTIONS.WIDTH / 2}
	      L ${tailsCenter} 0
	      H ${length}
      `}
			{...props}
		/>
	)
};
