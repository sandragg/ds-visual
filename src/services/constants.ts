export const enum TrackedActions {
	default,
	select,
	new,
	delete,
	change
}

export const enum PromiseStatus {
	pending = 'pending',
	resolved = 'resolved',
	rejected = 'rejected'
}

export const enum Direction {
	vertical,
	horizontal
}

export const enum FieldType {
	value,
	ref
}

export const FieldHeight = 30;

export const FieldWidth = {
	[FieldType.value]: 40,
	[FieldType.ref]: 20
};

export const enum ArrowType {
	cursor,
	link
}

export const enum Position {
	top,
	right,
	bottom,
	left
}

export const enum CursorOptions {
	length = 30,
	offset = 10
}
