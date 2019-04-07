import React, { HTMLAttributes } from 'react';
import './text-button.css';

type Props = HTMLAttributes<HTMLElement> & { theme: string };

export default ({ theme, className = '', children, ...props }: Props) => (
		<button
			className={`button button_${theme} ${className}`}
			{...props}
		>
			{children}
		</button>
);
