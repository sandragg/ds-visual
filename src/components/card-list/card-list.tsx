import React, { CSSProperties } from 'react';
import './card-list.css';

interface Props {
	style?: CSSProperties,
	children: any
}

const CardList = ({ children, style }: Props) => (
	<div className={`card-list`} style={style}>
		{children}
	</div>
);

export { CardList };
