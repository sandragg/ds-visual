import {
	RefObject,
	ComponentType,
	ReactNode
} from 'react';
import {
	Direction,
	FieldType,
	TrackedActions
} from 'src/services/constants';
import { PlainObject } from 'react-move/core';

export interface Structure {
	id: number,
	src: string,
	title: string,
	description: string[],
    operations_names?: string[],
    operations_srcs?: string[]
}

export type CallbackFunction = () => void;
export type IFunction = (...args: any[]) => any;

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

export interface PromiseStatus<P> extends Promise<P> {
	status: string
}

// @ts-ignore TODO how to fix????
export type TrackedClassItem = PropertyKey | [PropertyKey, TrackedItemOption];
// @ts-ignore
export type TrackedItemOption = string | TrackedClassItem[];

export interface AnimatedNode {
	ref: RefObject<HTMLElement>,
	animationAttrs: any
}

export interface NodeViewModel<VType> {
	id: number,
	ref: RefObject<HTMLElement>
	value: VType,
	coords: Point,
	inArrows?: number[],
	outArrows?: number[]
}

export interface ArrowViewModel {
	id: number,
	ref: RefObject<HTMLElement>,
	outCoords: Point,
	outNode: number,
	inCoords: Point,
	inNode: number
}

export interface ViewModel<VType> {
	nodes: Array<NodeViewModel<VType>>
	arrows?: ArrowViewModel[]
}

export interface InitialState<M, VType> {
	model: M,
	viewModel: ViewModel<VType>
}

export interface ModelAction {
	name: string,
	method: string
}

// TODO add getFieldCoords method
export interface NodeFactory {
	direction: Direction,
	fields: FieldType[],
	width: number,
	height: number,
	component: ComponentType
}

export interface NodeProps {
	nodeRef?: RefObject<SVGGElement>,
	attrs?: PlainObject,
	children: ReactNode[]
}

// TODO add iterator ?!
export interface History {
	history: HistoryStep[],
	animationHistory: AnimationHistoryStep[]
	push: (step: HistoryStep) => void,
	top: () => HistoryStep,
	reset: () => void,
	buildAnimationHistory: (vm: ViewModel<any>, cb: CallbackFunction) => void,
}

export interface HistoryStep {
	result: any,
	attrs: any[],
	opts?: TrackedItemOption
}

export interface AnimationHistoryStep {
	refs: Array<RefObject<HTMLElement>>,
	attrs: object,
	action?: TrackedActions,
	previousState?: number | null
}
