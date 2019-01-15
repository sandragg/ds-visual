import React, { CSSProperties } from 'react';
import './button.css';

interface Props {
	theme: string,
	children: string,
	style?: CSSProperties,
	disabled?: boolean
}

const Button = ({ theme, children, style, disabled }: Props) => (
		<button
			className={`button button_${theme}`}
			style={style}
			disabled={disabled}
		>
			{children}
		</button>
);

export { Button };
