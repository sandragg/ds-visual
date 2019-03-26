import React, {
	useState,
	forwardRef,
	useRef,
	useImperativeHandle,
	RefObject
} from 'react';
import Animate from 'react-move/Animate';
import { defer } from 'src/services/helpers';
import { PromiseDefer } from 'src/services/interface';

interface Props {
	children: JSX.Element,
	animationsAttrs: any
}

const AnimatedComponent = (props: Props, ref: RefObject<object>) => {
	const externalAnimAttrs = props.animationsAttrs;
	const [ internalAnimAttrs, setInternalAnimAttrs ] = useState(null);
	const promiseDefer = useRef<PromiseDefer | null>(null);
	const currentAnimAttrs = useCurrentAnimAttrs(externalAnimAttrs, internalAnimAttrs);

	useImperativeHandle(ref, () => ({
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
		<Animate {...currentAnimAttrs}>
			{attrs => React.cloneElement(props.children, { attrs, nodeRef: ref })}
		</Animate>
	);
};

export const Animated = forwardRef(AnimatedComponent);

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
