import React from 'react';
import {
	AnimationHistoryStep,
	ArrowViewModel,
	ControllerHistory,
	HistoryStep,
	NodeViewModel,
	Point,
	TrackedClassItem,
	ViewModel
} from 'src/services/interface';
import {
	areObjectsEqual,
	calcArrowMatrix
} from 'src/services/helpers';
import {
	ArrowType,
	CursorOptions,
	FieldType,
	TrackedActions
} from 'src/services/constants';
import { View } from 'src/containers/view';
import { Stack } from 'src/abstract-data-types/stack/array';
import { ArrayElementFactory } from 'src/services/node-factory';

let idCounter: number = 1;

export class ArrayView<VType> extends View<Stack<VType>, VType> {

	public static onTrack(history: ControllerHistory,
                        result: any,
                        args: any[],
                        [prop, action]: TrackedClassItem,
                        prevResult: any): void {
		if (!history.isUpdating) {
			return;
		}

		const prevStep = history.traces.top();
		const isChanged = arguments.length === 5;
		let id;
		let opts;
		let attrs;

		if (prop === 'up') {
			id = prop;
			opts = isChanged ? TrackedActions.change : TrackedActions.select;
			attrs = { 'up': isChanged ? [prevResult, result] : result };
		}
		else {
			id = Number(args[0]);
			opts = isChanged ? TrackedActions.change : TrackedActions.select;
			attrs = isChanged ? { 'value': [prevResult || '', result] } : {};
		}

		if (
				!prevStep
				|| prevStep.id !== id
				|| prevStep.opts !== opts
				|| !areObjectsEqual(prevStep.attrs, attrs)
		) {
			history.traces.push({ id, opts, attrs });
		}
	}

	protected Node = new ArrayElementFactory([FieldType.value]);

	protected readonly INITIAL_COORDS: Point = {
		x: this.Node.width,
		y: CursorOptions.length + CursorOptions.offset
	};

	constructor(props) {
		super(props);

		this.state = this.buildInitialViewModel();
	}
	// TODO NEED REFACTORING! Currently it recalculates entire model every time.
	public buildViewModel(model: Stack<VType>): void {
		const { stack, up } = model as any;

		if (up < 0) {
			this.viewModel = this.buildInitialViewModel();
			return;
		}

		this.viewModel = this.getViewInitialState();
		const { nodes, arrows } = this.viewModel;
		const cursorVM = this.state.arrows[0];

		nodes[0] = this.buildNodeViewModel([stack[0], 0]);
		for (let i = 1; i < Stack.STACK_SIZE; i++) {
			nodes[i] = this.buildNodeViewModel([stack[i], i], nodes[i - 1]);
		}
		arrows[0] = this.buildCursorViewModel(nodes[up], cursorVM && cursorVM.id);
	}

	public buildAnimationStep() {
		const lastState = {};

		function getAttrs(attrs: object, prevAttrs: boolean): object {
			let value;
			return Object.keys(attrs).reduce(
				(res, key) => {
					value = attrs[key];

					if (Array.isArray(value)) {
						res[key] = value[prevAttrs ? 0 : 1];
					}
					else if (!prevAttrs) {
						res[key] = value;
					}

					return res;
				},
				{}
			);
		}

		return (vm: ViewModel<VType>, { id, opts, attrs }: HistoryStep, hist?: AnimationHistoryStep[]): AnimationHistoryStep[] => {
			const itemVM = id === 'up'
				? vm.arrows[0]
				: vm.nodes.find(node => node.id === id);
			let prevStateIndex = id in lastState ? lastState[id] : null;
			const isChange = opts === TrackedActions.change;
			const steps = [];

			if (prevStateIndex === null) {
				steps.push({
					ref: itemVM.ref,
					action: TrackedActions.default,
					attrs: this.mapToAnimateAttrs(
						isChange
							? getAttrs(attrs, true)
							: attrs
					),
					previousState: prevStateIndex
				});

				prevStateIndex = hist.length;
			}
			else if (isChange) {
				const prevState = hist[prevStateIndex];

				prevState.attrs = this.mapToAnimateAttrs({
					...prevState.attrs,
					...getAttrs(attrs, true)
				});
			}

			steps.push({
				ref: itemVM.ref,
				action: opts,
				attrs: this.mapToAnimateAttrs(
					isChange
						? getAttrs(attrs, false)
						: attrs
				),
				previousState: prevStateIndex
			});

			lastState[id] = prevStateIndex + 1;

			return steps;
		};
	}

	protected buildNodeViewModel([ value, id ]: [VType, number],
                               parentVM?: NodeViewModel<VType>): NodeViewModel<VType> {
		const coords = parentVM ? parentVM.coords : null;

		return {
			id,
			ref: React.createRef(),
			value,
			coords: !parentVM
				? { x: 0, y: 0 }
				: {
					x: coords.x + this.Node.width,
					y: coords.y
				}
		};
	}

	protected buildCursorViewModel(nodeVM?: NodeViewModel<VType>,
                                 existedArrowId?: number ): ArrowViewModel {
		const id = existedArrowId || idCounter++;
		const [ outCoords, inCoords ] = this.getCursorCoords(
			nodeVM ? nodeVM.id : -1
		);

		return {
			id,
			ref: React.createRef(),
			outCoords,
			inCoords,
			type: ArrowType.cursor
		};
	}

	private buildInitialViewModel(): ViewModel<VType> {
		const initialValue = '' as any;
		const viewModel	= this.getViewInitialState();
		const { nodes, arrows } = viewModel;
		const cursorVM = this.state.arrows && this.state.arrows[0];

		nodes[0] = this.buildNodeViewModel([initialValue, 0]);
		for (let i = 1; i < Stack.STACK_SIZE; i++) {
			nodes[i] = this.buildNodeViewModel([initialValue, i], nodes[i - 1]);
		}
		arrows[0] = this.buildCursorViewModel(null, cursorVM && cursorVM.id);

		return viewModel;
	}

	private mapToAnimateAttrs(attrs) {
		const { up, ...other } = attrs;
		if (up === undefined) {
			return attrs;
		}

		const [ outPoint, inPoint ] = this.getCursorCoords(up);

		return {
			...other,
			transform: [`matrix(${calcArrowMatrix(outPoint, inPoint).matrix})`]
		}
	}

	private getCursorCoords(index: number): Point[] {
		const inNodeCoords = index === -1
				? { x: -this.Node.width, y: 0 }
				: this.Node.nodeCoords(index);

		const inPoint: Point = {
			x: inNodeCoords.x + this.Node.width / 2,
			y: inNodeCoords.y - CursorOptions.offset
		};
		const outPoint: Point = {
			x: inPoint.x,
			y: inPoint.y - CursorOptions.length
		};

		return [ outPoint, inPoint ];
	}
}
