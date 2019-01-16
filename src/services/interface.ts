export interface Structure {
	id: number,
	src: string,
	title: string,
	description: string
}

export interface Point {
	x: number,
	y: number
}

export interface ArrowParams {
    matrix: number[],
    length: number
}
