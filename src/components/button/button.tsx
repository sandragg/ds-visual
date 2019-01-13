import * as React from 'react';
import './button.css';

interface Props {
	theme: string,
	children: string,
	shape: string,
	disabled?: boolean
}

const Button = ({ theme, children, shape, disabled }: Props) => (
		<button
			className={`button button_${theme} button_${shape}`}
			disabled={disabled}
		>
			{children}
		</button>
);

export { Button };
