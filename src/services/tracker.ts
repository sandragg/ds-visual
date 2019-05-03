import {
	IFunction, Trace,
	TrackedClassItem,
	TrackedItemOption
} from './interface';
import { TrackedActions } from 'src/services/constants';
import { areObjectsEqual } from 'src/utils/animation';

type ProxyApplyHandler = ProxyHandler<IFunction>['apply'];
type ProxyConstructHandler = ProxyHandler<IFunction>['construct'];
type TrackHandler = (key: PropertyKey, res: any, args: any[], opt: TrackedClassItem, prevRes?: any) => void;

/**
 * Proxy wrappers provide tracking for certain properties and methods.
 * @param thisArg Class instance
 * @param trackedItems Class properties and methods that should be tracked
 * @param handler Handler is used for any outside logic.
 *        Callback accepts current operation result, tracking options
 *        and previous result or passed arguments.
 */
function bindTracker<M>(thisArg: M,
                        trackedItems: TrackedClassItem[],
                        handler: TrackHandler): M {
	/* The binding is unnecessary if handler isn't a function. */
	if (typeof handler !== 'function') {
		return thisArg;
	}
	/* Proxy handlers: apply - function call, construct - create new instance. */
	const applyHandler: (opt: TrackedClassItem) => ProxyApplyHandler =
		opt =>
		(target: IFunction, thisArg: M, argArray?: any): any => {
			const res: any = Reflect.apply(target, thisArg, argArray);
			const option = Array.isArray(opt) ? opt[1] : null;
			handler(option ? opt[0] : opt, res, argArray, option);
			return res;
		};
	const constructHandler: (opt: TrackedClassItem) => ProxyConstructHandler =
		opt =>
		(target: IFunction, argArray?: any): object => {
			let res: any = Reflect.construct(target, argArray);
			const option = Array.isArray(opt) ? opt[1] : null;
			res = bindTracker(res, option, handler);
			handler(option ? opt[0] : opt, res, argArray, TrackedActions.new);
			return res;
		};

	if (!trackedItems && thisArg && typeof thisArg === 'object') {
		return wrapObjectItem(thisArg, handler);
	}

	/* Set Proxy wrapper on every tracked item. */
	trackedItems.forEach(item => {
		let itemName: PropertyKey;
		let option: TrackedItemOption;
		if (Array.isArray(item)) {
			[ itemName, option ] = item;
		}
		else {
			itemName = item;
		}

		const classProp: keyof M = thisArg[itemName];
		const apply: ProxyApplyHandler = applyHandler(item);
		const construct: ProxyConstructHandler = constructHandler(item);
		/* Construct handler is used for binding internal classes. */
		if (typeof classProp === 'function') {
			thisArg[itemName] = new Proxy(classProp, { apply, construct });
			return;
		}

		if (classProp && typeof classProp === 'object') {
			thisArg[itemName] = wrapObjectItem(classProp, handler, option);
			return;
		}

		const propDesc: PropertyDescriptor = Object.getOwnPropertyDescriptor(
			thisArg,
			itemName
		);
		const { get, set } = propDesc;
		/* For properties set Proxy wrapper on getter/setter. */
		Object.defineProperty(thisArg, itemName, {
			...propDesc,
			get: get && new Proxy(get, { apply }),
			set: set && new Proxy(set, {
				apply(target: IFunction, thisArg: object, argArray?: any): any {
					const prev: any = Reflect.get(thisArg, itemName);
					const res: any = Reflect.apply(target, thisArg, argArray);
					handler(itemName, res, argArray, option, prev);
					return res;
				}
			})
		});
	});

	return thisArg;
}

function wrapObjectItem(instance: any, handler: TrackHandler, option?: TrackedItemOption) {
	return new Proxy(instance, {
		get(target: never, p: PropertyKey): any {
			const res: any = Reflect.get(target, p);
			handler(p, res, [target], option);
			return res;
		},
		set(target: never, p: PropertyKey, value: any): boolean {
			const prev: any = Reflect.get(target, p);
			handler(p, value, [target], option, prev);
			return Reflect.set(target, p, value);
		}
	});
}

/**
 * Handler for history build. Called for each access to the tracked property.
 * @param trace History
 * @param result Action result
 * @param args Passed arguments
 * @param [prop, action] Tracked property
 * @param prevResult Previous value for mutating action (optional)
 */
const onTrack = (trace: Trace): TrackHandler => (
		key: string | number,
		result: any,
		args: any[],
		option: TrackedItemOption,
		prevResult?: any
): void => {

	if (!trace.isUpdating) {
		return;
	}
	console.log(key, result, args, opt, prevResult);
	const isIndex = !isNaN(Number(key));
	const prevStep = trace.history.top();
	const isChanged = prevResult !== undefined;

	const id = isIndex
			? Number(key)
			: option ? key : args[0].id;
	const opts = isChanged
			? TrackedActions.change
			: option || TrackedActions.select;
	const attrs = {
		[isIndex ? 'value' : key]:
				isChanged ? [prevResult, result] : result
	};

	if (
			!prevStep
			|| prevStep.id !== id
			|| prevStep.opts !== opts
			|| !areObjectsEqual(prevStep.attrs, attrs)
	) {
		trace.history.push({ id, opts, attrs });
	}
};

export {
	bindTracker,
	onTrack
}
