import React, {
	useState,
	forwardRef,
	useRef,
	useImperativeHandle,
	RefObject
} from 'react';
import Animate from 'react-move/Animate';
import {
	interpolate,
	interpolateTransformSvg
} from 'd3-interpolate';
import { defer } from 'src/utils/animation';
import { PromiseDefer } from 'src/services/interface';

interface Props {
	id: number | string,
	children: JSX.Element,
	animationsAttrs: any
}

const AnimatedComponent = (props: Props, ref: RefObject<object>) => {
	const externalAnimAttrs = props.animationsAttrs;
	const [ internalAnimAttrs, setInternalAnimAttrs ] = useState(null);
	const promiseDefer = useRef<PromiseDefer | null>(null);
	const currentAnimAttrs = useCurrentAnimAttrs(externalAnimAttrs, internalAnimAttrs);

	useImperativeHandle(ref, () => ({
		id: props.id,
		node: ref.current,
		animate: (newAnimAttrs: any): Promise<any> => {
			promiseDefer.current = defer();
			setInternalAnimAttrs(
					calcNewInternalAnimAttrs(newAnimAttrs, promiseDefer.current)
			);

			return promiseDefer.current.promise;
		}
	}), [ref]);

	return (
		<Animate
			interpolation={interpolateValue}
			{...currentAnimAttrs}
		>
			{attrs => React.cloneElement(props.children, { attrs, nodeRef: ref })}
		</Animate>
	);
};

/**
 * Define which attributes to use as Animate component prop.
 * @param externalAttrs
 * @param internalAttrs
 */
function useCurrentAnimAttrs(externalAttrs: any, internalAttrs: any): any {
	const prevInternalAttrs = useRef(internalAttrs);

	if (prevInternalAttrs.current === internalAttrs) {
		return externalAttrs;
	}
	else {
		prevInternalAttrs.current = internalAttrs;
		return internalAttrs;
	}
}

/**
 * Add on animation end callback for promise resolving.
 * @param newAttrs
 * @param promiseDefer
 */
function calcNewInternalAnimAttrs(newAttrs: any, promiseDefer: PromiseDefer) {
	const newAnimAttrs = { update: newAttrs };

	if (!promiseDefer) {
		return newAnimAttrs;
	}

	const lastAnimation = Array.isArray(newAttrs)
			? newAttrs[newAttrs.length - 1]
			: newAttrs;
	const lastAnimationEndCb = lastAnimation.events && lastAnimation.events.end;
	const onAnimationEnd = () => promiseDefer.resolve();

	if (!lastAnimationEndCb) {
		lastAnimation.events || (lastAnimation.events = {});
		lastAnimation.events.end = onAnimationEnd;
	}
	else {
		lastAnimation.events.end = () => {
			lastAnimationEndCb();
			onAnimationEnd();
		}
	}

	return newAnimAttrs;
}

function interpolateValue(begValue, endValue, attr) {
	if (attr === 'transform') {
		return interpolateTransformSvg(begValue, endValue)
	}

	return interpolate(begValue, endValue)
}

export const Animated = forwardRef(AnimatedComponent);
