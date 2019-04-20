import React, { useMemo } from 'react';
import { calcTransformValue } from 'src/utils/animation';
import { NodeProps } from 'src/services/interface';
import './node.css';
import { calculateNodeMatrix } from 'src/utils/positioning';

export const Node = ({ children, nodeRef, attrs }: NodeProps) => {
	const matrix: number[] = useMemo(
		() => calculateNodeMatrix({ x: Number(attrs.x), y: Number(attrs.y) }),
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
