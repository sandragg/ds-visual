import * as React from 'react';
import './canvas.css';

interface Props {
	children: JSX.Element
}

const Canvas = (props: Props) => {
	const { children } = props;

	return (
		<svg className="canvas">
			{children}
		</svg>
	);
};

export { Canvas };
