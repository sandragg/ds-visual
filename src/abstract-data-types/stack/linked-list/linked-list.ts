import { Element } from './element';

export class Stack<VType> implements ADTStack<VType> {
	public static OUT_OF_DOMAIN: null = null;

	private head: LListElement<VType>;

	constructor() {
		this.head = null;
	}

	public push(value: VType): void {
		this.head = new Element(value, this.head);
	}

	public pop(): VType {
		const topElement = this.head;
		this.head = topElement.next;

		return topElement.value;
	}

	public top(): VType {
		return this.head.value;
	}

	public erase(): void {
		this.head = Stack.OUT_OF_DOMAIN;
	}

	public full(): boolean {
		return false;
	}

	public empty(): boolean {
		return this.head === Stack.OUT_OF_DOMAIN;
	}
}
