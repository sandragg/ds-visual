import React, { HTMLAttributes } from 'react';
import './icon-button.css';

type Props = HTMLAttributes<HTMLButtonElement>

export default ({ className = '', children, ...props }: Props) => (
		<button
				className={`icon-button ${className}`}
				{...props}
		>
			{children}
		</button>
);
