import React, { SVGAttributes } from 'react';

export default ({ fill, ...params }: SVGAttributes<SVGSVGElement>) => (
	<svg
		version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg"
		x="0px" y="0px"
		height="100%"
		viewBox="0 0 307.046 307.046"
		style={{ fill }}
		{...params}
	>
		<g>
			<path d="M239.087,142.427L101.259,4.597c-6.133-6.129-16.073-6.129-22.203,0L67.955,15.698c-6.129,6.133-6.129,16.076,0,22.201
				l115.621,115.626L67.955,269.135c-6.129,6.136-6.129,16.086,0,22.209l11.101,11.101c6.13,6.136,16.07,6.136,22.203,0
				l137.828-137.831C245.222,158.487,245.222,148.556,239.087,142.427z" />
		</g>
	</svg>
);
