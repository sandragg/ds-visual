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
	SubsequentNodeFactory,
	SubsequentNodeFactoryConfig
} from 'src/services/node-factory';
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
	calcArrowMatrix,
	filterElementAttrs
} from 'src/services/helpers';

let idCounter: number = 1;

const nodeFactoryConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		direction: Direction.vertical,
		reverse: true
	},
	node: {
		fields: {
			value: FieldType.value
		},
		direction: Direction.horizontal,
		offset: 0
	}
};

export class AbstractView<VType> extends View<Stack<VType>, VType> {

	protected Node = new SubsequentNodeFactory(nodeFactoryConfig);

	// TODO define init coords relative to view port
	protected readonly INITIAL_COORDS: Point = {
		x: 500,
		y: 400
	};

	constructor(props) {
		super(props);
		this.state = this.buildInitialViewModel();
	}

	public buildAnimationStep() {
		return (vm: ViewModel<VType>, { id, opts, attrs }: HistoryStep): AnimationHistoryStep[] => {
			const steps = [];
			const up = attrs.up;

			if (!Array.isArray(up)) {
				return steps;
			}

			const cursorVM = vm.arrows[0];
			const nodeId = up[0] > up[1] ? up[0] : up[1];
			const emptyAttrs = {};

			const changedElements = [
				{
					ref: cursorVM.ref,
					action: TrackedActions.change,
					attrs: this.mapToAnimateAttrs(filterElementAttrs(attrs, false)),
					previousState: 0
				}
			];

			if (up[0] !== up[1]) {
				up[1] === -1
					? changedElements.push(...vm.nodes.map(node => (
							{
								ref: node.ref,
								action: TrackedActions.delete,
								attrs: emptyAttrs,
								previousState: null
							}
						)))
					: changedElements.push({
							ref: vm.nodes.find(node => node.id === nodeId).ref,
							action: up[0] > up[1] ? TrackedActions.delete : TrackedActions.new,
							attrs: emptyAttrs,
							previousState: null
						});
			}

			steps.push(
				{
					ref: cursorVM.ref,
					action: TrackedActions.default,
					attrs: this.mapToAnimateAttrs(filterElementAttrs(attrs, true)),
					previousState: null
				},
				changedElements
			);

			return steps;
		};
	}

	public buildViewModel(model: Stack<VType>): void {
		const { stack, up } = model as any;

		this.viewModel = this.getViewInitialState();
		const { nodes, arrows } = this.viewModel;
		const cursorVM = this.state.arrows[0];

		for (let i = 0; i <= up; i++) {
			nodes[i] = this.buildNodeViewModel([stack[i], i]);
		}
		arrows[0] = this.buildCursorViewModel(nodes[up], cursorVM && cursorVM.id);
	}

	protected buildInitialViewModel(): ViewModel<VType> {
		const viewModel	= this.getViewInitialState();

		viewModel.arrows[0] = this.buildCursorViewModel();

		return viewModel;
	}

	protected buildNodeViewModel([ value, id ]: [VType, number]): NodeViewModel<VType> {
		return {
			id,
			ref: React.createRef(),
			value,
			coords: this.Node.getNodeCoords(id)
		};
	}
	// TODO extract
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

	private buildCursorViewModel(nodeVM?: NodeViewModel<VType>,
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

	private getCursorCoords(index: number): Point[] {
		const inNodeCoords = index === -1
				? { x: 0, y: this.Node.height }
				: this.Node.getNodeCoords(index);

		const inPoint: Point = {
			x: inNodeCoords.x - CursorOptions.offset,
			y: inNodeCoords.y + this.Node.height / 2
		};
		const outPoint: Point = {
			x: inPoint.x - CursorOptions.length,
			y: inPoint.y
		};

		return [ outPoint, inPoint ];
	}
}
