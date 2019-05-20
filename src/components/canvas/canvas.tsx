import * as React from 'react';
import './canvas.css';
import { FunctionComponent, useRef, useState, useCallback } from 'react';
import ReactResizeDetector from 'react-resize-detector';

interface Props {
	children: JSX.Element
}

const Canvas: FunctionComponent<Props> = (props) => {
	const { children } = props;

	const [ dimension, setDimensions ] = useState({});
	const ref = useRef<SVGSVGElement>(null);

	const onResize = useCallback(
			(w, h) => {
			const size = ref.current.getBoundingClientRect();
			setDimensions({ width: size.width, height: size.height });
		},
			[]
	);

	return (
		<ReactResizeDetector
			handleWidth handleHeight
			refreshMode="throttle"
			refreshRate={80}
			nodeType="section"
			onResize={onResize}
		>
			<svg className="canvas" ref={ref}>
				{React.cloneElement(children, { dimension })}
			</svg>
		</ReactResizeDetector>
	);
};

export { Canvas };
