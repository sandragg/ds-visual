import React, {
	useMemo,
	RefObject
} from 'react';
import { calcArrowMatrix } from 'src/services/helpers';
import { Point, ArrowParams } from 'src/services/interface';

interface Props {
	nodeRef?: RefObject<any>,
	attrs?: any,
	outPoint: Point,
	inPoint: Point
}

const Arrow = ({ nodeRef, attrs, outPoint, inPoint }: Props) => {
	const { matrix, length }: ArrowParams = useMemo(
			() => calcArrowMatrix(outPoint, inPoint),
			[outPoint, inPoint]
	);
	const tailsCenter = length * 0.55;

	return (
		<path
			ref={nodeRef}
			className="arrow"
			transform={`matrix(${matrix})`}
			d={`
	      M 0 0
	      H ${tailsCenter}
	      M ${tailsCenter} 0
	      L ${tailsCenter - 10} 5
	      C ${tailsCenter - 7} 3 ${tailsCenter - 7} -3 ${tailsCenter - 10} -5
	      L ${tailsCenter} 0
	      H ${length}
      `}
			{...attrs}
		/>
	)
};

export { Arrow };
