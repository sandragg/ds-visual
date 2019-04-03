import React, { HTMLAttributes } from 'react';
import './button.css';

interface Props extends HTMLAttributes<HTMLElement> {
	theme: string,
	disabled?: boolean
}

const Button = ({ theme, className = '', children, ...props }: Props) => (
		<button
			className={`button button_${theme} ${className}`}
			{...props}
		>
			{children}
		</button>
);

export { Button };
