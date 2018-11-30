import * as React from 'react';
import './direction-arrow.css';

interface Props {
	children: string,
	style?: object
}

export const DirectionArrow = ({ children, style }: Props) => (
	<figure className="direct-arrow-pic" style={style}>
		<svg className="direct-arrow-pic__svg" viewBox="0 0 290 170">
			<path className="svg__figure" d="M 2 2 144 168 288 2" />
			<text className="svg__caption" x="145" y="85">{children}</text>
		</svg>
	</figure>
);
