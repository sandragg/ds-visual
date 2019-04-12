import {
	RefObject,
	ComponentType,
	ReactNode
} from 'react';
import {
	ArrowType,
	Direction,
	FieldType,
	TrackedActions
} from 'src/services/constants';
import { PlainObject } from 'react-move/core';
import { History } from 'src/services/history';

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
export type TrackedItemOption = TrackedActions | TrackedClassItem[];

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
	outNode?: number,
	inCoords: Point,
	inNode?: number,
	type: ArrowType
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
	method: string,
	mutable: boolean
	prerender?: boolean
}

// TODO add getFieldCoords method
export interface NodeFactory {
	direction: Direction,
	fields: FieldType[],
	width: number,
	height: number,
	component: ComponentType,
	nodeCoords(index: number): Point
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
	push(step: HistoryStep): void,
	top(): HistoryStep,
	reset(): void,
	buildAnimationHistory(vm: ViewModel<any>, cb: Function): void,
}

export interface HistoryStep {
	id: number | string,
	attrs: object,
	opts?: TrackedActions
}

interface AnimatedElement {
	id: number | string,
	animate(animAttrs: any): Promise<any>
}

export type AnimationHistoryStep = ElementAnimationStep | ElementAnimationStep[];

export interface ElementAnimationStep {
	ref: RefObject<AnimatedElement>,
	attrs: object,
	action?: TrackedActions,
	previousState?: number | null
}

export interface VMC {
	view: ADTView<any, any>,
	validateModelOperation(handler: (model: any) => ValidationResponse): ValidationResponse,
	build(action: ModelAction, params: any[], preUpdateCb?: CallbackFunction, postUpdateCb?: CallbackFunction): Promise<void>,
	render(): Promise<void>
}

export interface AC {
	history: ControllerHistory,
	toggleHistoryStatus(): void,
	build(vm: ViewModel<any>, handler: Function): void,
	start(): Promise<void>
	clearHistory(): void
	// + methods to change animation steps
}

export interface ADTView<M, VType> {
	state: ViewModel<VType>,
	viewModel: ViewModel<VType>,
	buildViewModel(model: M): void,
	applyViewModel(cb?: CallbackFunction): void,
	buildAnimationStep(): (vm: ViewModel<VType>, step: HistoryStep, hist?: AnimationHistoryStep[]) => AnimationHistoryStep[]
}

export interface Trace {
	history: History,
	isUpdating: boolean
}

export interface ViewFrame<M, V extends ADTView<M, any>> {
	ViewModelController: VMC,
	AnimationController: AC,
	component: ComponentType
}

export interface ValidationResponse {
	isValid: boolean,
	errorText?: string
}