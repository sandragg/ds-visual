import { Element } from './element';
import { BulkType } from 'src/services/constants';

export class Stack<VType> implements ADTStack<VType> {
	public static OUT_OF_DOMAIN: null = null;

	public head: Element<VType>;
	private _head: Element<VType>;

	private Element = Element;

	constructor() {
		Object.defineProperty(this, 'head', {
			get() {
				return this._head;
			},
			set(v) {
				const prevValue = this._head;
				this._head = v;
				return prevValue;
			},
			configurable: true
		});

		this.head = null;
	}

	public push(value: VType): void {
		this.head = new this.Element(value, this.head);
	}

	public pop(): VType {
		const topElement = this.head;
		const value = topElement.value;

		this.head = topElement.next;
		this.delete(topElement);

		return value;
	}

	public top(): VType {
		return this.head.value;
	}

	public erase(): void {
		this.delete({ bulkType: BulkType.all });
		this.head = Stack.OUT_OF_DOMAIN;
	}

	public full(): boolean {
		return false;
	}

	public empty(): boolean {
		return this.head === Stack.OUT_OF_DOMAIN;
	}
	// for tracking element deleting
	private delete(element: object): object {
		return element;
	}
}
