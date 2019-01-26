import React, {
	useMemo,
	RefObject,
	HTMLAttributes,
	SVGAttributes
} from 'react';
import './node.css';
import { calcTransformValue, calcNodeMatrix } from 'src/services/helpers';
import { NODE_OPTIONS } from 'src/services/constants';
import { Point } from 'src/services/interface';

interface Props extends HTMLAttributes<HTMLElement> {
	nodeRef?: RefObject<SVGGElement>,
	attrs?: SVGAttributes<SVGElement>
}

const nodeCenterPoint: Point = {
	x: NODE_OPTIONS.WIDTH / 2,
	y: NODE_OPTIONS.HEIGHT / 2
};

export const Node = ({ children, nodeRef, attrs }: Props) => {
	const matrix: number[] = useMemo(
	() => calcNodeMatrix({ x: Number(attrs.x), y: Number(attrs.y) }),
	[attrs.x, attrs.y]
	);
	const transformValue: string = calcTransformValue(attrs);

	return (
		<g
			ref={nodeRef}
			className="node"
			transform={`matrix(${matrix}) ${transformValue}`}
			{...attrs}
		>
			<rect
				className="node__figure"
				height={NODE_OPTIONS.HEIGHT}
				width={NODE_OPTIONS.WIDTH}
				rx="6"
				fill={attrs.fill}
			/>
			<text
				className="node__caption"
				x={nodeCenterPoint.x}
				y={nodeCenterPoint.y}
			>
				{children}
			</text>
		</g>
	);
};
