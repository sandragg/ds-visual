import { TrackedClassItem } from 'src/services/interface';
import { TrackedActions } from 'src/services/constants';

export class Stack<VType> implements ADTStack<VType> {

	public static OUT_OF_DOMAIN: number = -1;
	private static STACK_SIZE: number = 20;

	private readonly stack: VType[];
	private up: number;
	private _up: number;

	constructor() {
		// Use defineProperty in order to return value from setter
		Object.defineProperty(this, 'up', {
			get() {
				return this._up;
			},
			set(v) {
				return this._up = v;
			},
			configurable: true
		});

		this.stack = new Array(Stack.STACK_SIZE);
		this.reset();
	}

	public push(value: VType): void {
		this.stack[++this.up] = value;
	}

	public pop(): VType {
		return this.stack[this.up--];
	}

	public top(): VType {
		return this.stack[this.up];
	}

	public erase(): void {
		this.reset();
	}

	public full(): boolean {
		return this.up === Stack.STACK_SIZE - 1;
	}

	public empty(): boolean {
		return this.up === Stack.OUT_OF_DOMAIN;
	}

	private reset(): void {
		this.up = Stack.OUT_OF_DOMAIN;
	}
}

export const StackTrackedItems: TrackedClassItem[] = [
	['up', TrackedActions.select]
];
