import React, { SVGAttributes } from 'react';
import ForwardIcon from './forward';

export default (props: SVGAttributes<SVGSVGElement>) => (
	<ForwardIcon
			style={{ transform: 'rotate(180deg)' }}
			{...props}
	/>
);
