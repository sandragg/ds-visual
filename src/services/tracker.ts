import {
	IFunction,
	TrackedClassItem,
	TrackedItemOption
} from './interface';

type ProxyApplyHandler = ProxyHandler<IFunction>['apply'];
type ProxyConstructHandler = ProxyHandler<IFunction>['construct'];

/**
 * Proxy wrappers provide tracking for certain properties and methods.
 * @param thisArg Class instance
 * @param trackedItems Class properties and methods that should be tracked
 * @param handler Handler is used for any outside logic.
 *        Callback accepts current operation result, tracking options
 *        and previous result or passed arguments.
 */
export function bindTracker<M>(thisArg: M,
                                      trackedItems: TrackedClassItem[],
                                      handler: (res: any, args: any, opt?: TrackedItemOption) => void): M {
	/* The binding is unnecessary if handler isn't a function. */
	if (typeof handler !== 'function') {
		return thisArg;
	}
	/* Proxy handlers: apply - function call, construct - create new instance. */
	const applyHandler: (opt: TrackedItemOption) => ProxyApplyHandler =
			opt =>
			(target: IFunction, thisArg: M, argArray?: any): any => {
				const res: any = Reflect.apply(target, thisArg, argArray);
				handler(res, argArray, opt);
				return res;
			};
	const constructHandler: (opt: TrackedItemOption) => ProxyConstructHandler =
			opt =>
			(target: IFunction, argArray?: any): object => {
				let res: any = Reflect.construct(target, argArray);
				res = bindTracker(res, opt, handler);
				return res;
			};

	/* Set Proxy wrapper on every tracked item. */
	trackedItems.forEach(item => {
		let itemName: PropertyKey;
		let opt: TrackedItemOption;
		if (Array.isArray(item)) {
			[ itemName, opt ] = item;
		}
		else {
			itemName = item;
		}

		const classProp: keyof M = thisArg[itemName];
		const apply: ProxyApplyHandler = applyHandler(opt);
		const construct: ProxyConstructHandler = constructHandler(opt);
		/* Construct handler is used for binding internal classes. */
		if (typeof classProp === 'function') {
			thisArg[itemName] = new Proxy(classProp, { apply, construct });
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
						handler(res, prev, opt);
						return res;
					}
				})
		});
	});

	return thisArg;
}
