interface ADTStack<VType> {
	push(V: VType): void,
	pop(): VType,
	top(): VType,
	erase(): void,
	full(): boolean,
	empty(): boolean
}
