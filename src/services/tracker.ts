import { TrackedClassItem, TrackedItemOption } from './interface';

/**
 * Wrap accepted class instance and provide Proxy tracking for certain properties and methods.
 * @param thisArg Class instance
 * @param trackedItems Class properties and methods that should be tracked
 * @param handlerCb Handler callback is used for any outside logic.
 *        Callback accepts current operation result as the first argument
 *        and extra tracking options as the second.
 */
export function bindTracker(thisArg: any,
                            trackedItems: TrackedClassItem[],
                            handlerCb: (res: any, opt: TrackedItemOption) => void): any {
	/**
	 * If tracked list is missing or empty, or handler callback
	 * isn't a function, then the binding is unnecessary.
	 */
	if (!trackedItems
			|| !trackedItems.length
			|| typeof handlerCb !== 'function') {
		return thisArg;
	}
	/* Common Proxy for tracking object(instance) properties. */
	thisArg = new Proxy(
			thisArg,
			{
				get(target: object, p: PropertyKey): any {
					const res: any = Reflect.get(target, p);
					const trackedItem: TrackedClassItem | undefined =
							getTrackedPropByName(target, trackedItems, p);

					if (trackedItem) {
						handlerCb(res, Array.isArray(trackedItem) && trackedItem[1]);
					}

					return res;
				}
			}
	);
	/* Proxy wrapper on every tracked method. */
	trackedItems.forEach(item => {
		let itemName: PropertyKey;
		let opt: TrackedItemOption | undefined;
		if (Array.isArray(item)) {
			[ itemName, opt ] = item;
		}
		else {
			itemName = item;
		}

		const classProp: any = thisArg[itemName];
		if (typeof classProp !== 'function') {
			return;
		}
		/* Construct handler is used for binding internal classes. */
		thisArg[itemName] = new Proxy(
				classProp,
				{
					apply(target: Function, thisArg: any, argArray?: any): any {
						const res: any = Reflect.apply(target, thisArg, argArray);
						handlerCb(res, opt);
						return res;
					},
					construct(target: Function, argArray?: any): object {
						let res: any = Reflect.construct(target, argArray);
						res = bindTracker(res, opt, handlerCb);
						return res;
					}
				}
		);
	});

	return thisArg;
}

/**
 * Return TrackedClassItem if the class item with the passed name(key)
 * isn't a method and is in a tracked list, else - undefined.
 * @param target Class instance
 * @param trackedItems Class properties and methods that should be tracked
 * @param itemName Property key
 */
function getTrackedPropByName(target: object,
                              trackedItems: TrackedClassItem[],
                              itemName: PropertyKey): TrackedClassItem {
	return typeof target[itemName] !== 'function'
			&& trackedItems.find(item => item[0] === itemName);
}
