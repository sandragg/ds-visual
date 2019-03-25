export class Element<VType> implements LListElement<VType> {
	public value: VType;
	public next: Element<VType>;

	constructor(value: VType, next: Element<VType> = null) {
		this.value = value;
		this.next = next;
	}
}
