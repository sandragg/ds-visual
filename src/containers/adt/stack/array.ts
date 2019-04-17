import React from 'react';
import {
	AnimationHistoryStep,
	ArrowViewModel,
	HistoryStep,
	NodeViewModel,
	Point,
	ViewModel
} from 'src/services/interface';
import {
	calcArrowMatrix,
	filterElementAttrs
} from 'src/services/helpers';
import {
	ArrowType,
	CursorOptions,
	Direction,
	FieldType,
	TrackedActions
} from 'src/services/constants';
import { View } from 'src/containers/view';
import { Stack } from 'src/abstract-data-types/stack/array';
import {
	SubsequentNodeFactory,
	SubsequentNodeFactoryConfig
} from 'src/services/node-factory';

let idCounter: number = 1;

const nodeFactoryConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		direction: Direction.horizontal,
		reverse: false
	},
	node: {
		fields: [ FieldType.value ],
		direction: Direction.horizontal,
		offset: 0
	}
};

export class ArrayView<VType> extends View<Stack<VType>, VType> {

	protected Node = new SubsequentNodeFactory(nodeFactoryConfig);

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

		this.viewModel = this.getViewInitialState();
		const { nodes, arrows } = this.viewModel;
		const cursorVM = this.state.arrows[0];

		nodes[0] = this.buildNodeViewModel([stack[0], 0]);
		for (let i = 1; i < Stack.STACK_SIZE; i++) {
			nodes[i] = this.buildNodeViewModel([stack[i], i]);
		}
		arrows[0] = this.buildCursorViewModel(nodes[up], cursorVM && cursorVM.id);
	}

	// TODO revise!!!
	public buildAnimationStep() {
		const lastState = {};

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
							? filterElementAttrs(attrs, true)
							: attrs
					),
					previousState: prevStateIndex
				});

				prevStateIndex = hist.length;
			}
			else if (isChange) {
				const prevState = hist[prevStateIndex];

				// @ts-ignore
				prevState.attrs = this.mapToAnimateAttrs({
					// @ts-ignore
					...prevState.attrs,
					...filterElementAttrs(attrs, true)
				});
			}

			steps.push({
				ref: itemVM.ref,
				action: opts,
				attrs: this.mapToAnimateAttrs(
					isChange
						? filterElementAttrs(attrs, false)
						: attrs
				),
				previousState: prevStateIndex
			});

			lastState[id] = prevStateIndex + 1;

			return steps;
		};
	}

	protected buildNodeViewModel([ value, id ]: [VType, number]): NodeViewModel<VType> {
		return {
			id,
			ref: React.createRef(),
			value,
			coords: this.Node.getNodeCoords(id)
		};
	}

	protected buildCursorViewModel(nodeVM?: NodeViewModel<VType>,
                                 existedArrowId?: number | string): ArrowViewModel {
		const id = existedArrowId || `up${idCounter++}`;
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

	protected buildInitialViewModel(): ViewModel<VType> {
		const initialValue = '' as any;
		const viewModel	= this.getViewInitialState();
		const { nodes, arrows } = viewModel;

		nodes[0] = this.buildNodeViewModel([initialValue, 0]);
		for (let i = 1; i < Stack.STACK_SIZE; i++) {
			nodes[i] = this.buildNodeViewModel([initialValue, i]);
		}
		arrows[0] = this.buildCursorViewModel();

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
				: this.Node.getNodeCoords(index);

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
