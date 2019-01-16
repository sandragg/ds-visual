export interface Structure {
	id: number,
	src: string,
	title: string,
	description: string
}

export type CallbackFunction = () => void;

export interface Point {
	x: number,
	y: number
}

export interface ArrowParams {
    matrix: number[],
    length: number
}

export interface PromiseDefer {
	promise: Promise<any>,
	resolve: CallbackFunction,
	reject: CallbackFunction
}
