import React, { useMemo } from 'react';
import {
	calcTransformValue,
	calcNodeMatrix
} from 'src/services/helpers';
import { NodeProps } from 'src/services/interface';
import './node.css';

export const Node = ({ children, nodeRef, attrs }: NodeProps) => {
	const matrix: number[] = useMemo(
	() => calcNodeMatrix({ x: Number(attrs.x), y: Number(attrs.y) }),
	[attrs.x, attrs.y]
	);
	const transform: string = calcTransformValue(attrs);

	return (
		<g
			ref={nodeRef}
			className="node"
			transform={`matrix(${matrix}) ${transform}`}
			{...attrs}
		>
			{children}
		</g>
	);
};
