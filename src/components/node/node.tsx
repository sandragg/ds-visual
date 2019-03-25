import React, {
	useMemo,
	RefObject,
	ReactNode
} from 'react';
import {
	calcTransformValue,
	calcNodeMatrix
} from 'src/services/helpers';
import { PlainObject } from 'react-move/core';
import './node.css';

interface Props {
	nodeRef?: RefObject<SVGGElement>,
	attrs?: PlainObject,
	children: ReactNode[]
}

export const Node = ({ children, nodeRef, attrs }: Props) => {
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
