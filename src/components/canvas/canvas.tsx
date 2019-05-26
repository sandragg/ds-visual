import React, {
	FunctionComponent,
	useRef,
	useState,
	useCallback
} from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { Dimension } from 'src/services/interface';
import './canvas.css';

interface Props {
	onResize: () => void,
	children: JSX.Element
}

const Canvas: FunctionComponent<Props> = (props) => {
	const [ dimension, setDimensions ] = useState<Dimension>({ width: 0, height: 0 });
	const ref = useRef<SVGSVGElement>(null);

	const onResize = useCallback(
		(width, height) => {
			const size = ref.current.getBoundingClientRect();
			props.onResize();
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
				{React.cloneElement(props.children, { dimension })}
			</svg>
		</ReactResizeDetector>
	);
};

export { Canvas };
