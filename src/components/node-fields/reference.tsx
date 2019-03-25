import React from 'react';
import {
	FieldHeight,
	FieldWidth,
	FieldType
} from 'src/services/constants';

export const RefField = ({ attrs }) => (
	<rect
		className="node__figure"
		x={attrs.x}
		y={attrs.y}
		height={FieldHeight}
		width={attrs.width || FieldWidth[FieldType.ref]}
		fill={attrs.fill}
	/>
);
