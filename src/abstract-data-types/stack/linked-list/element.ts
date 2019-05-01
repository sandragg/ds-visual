let idCounter: number = 0;

export class Element<VType> {
	public readonly id: number;
	public value: VType;
	public next: Element<VType>;

	constructor(value: VType, next: Element<VType> = null) {
		this.id = idCounter++;
		this.value = value;
		this.next = next;
	}
}
