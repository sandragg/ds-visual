import React, {
	useMemo,
	RefObject
} from 'react';
import './node.css';
import { calcTransformValue, calcNodeMatrix } from 'src/services/helpers';
import { NODE_OPTIONS } from 'src/services/constants';

interface Props {
	children: any,
	nodeRef?: RefObject<any>,
	attrs?: any
}

const nodeCenterPoint = {
	x: NODE_OPTIONS.WIDTH / 2,
	y: NODE_OPTIONS.HEIGHT / 2
};

export const Node = ({ children, nodeRef, attrs }: Props) => {
	const matrix: number[] = useMemo(
			() => calcNodeMatrix({ x: attrs.x, y: attrs.y }),
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
