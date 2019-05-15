import React from 'react';
import {
	ArrowViewModel,
	ElementAnimationStep,
	ElementViewModel,
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
	Position,
	Direction,
	FieldType,
	TrackedActions
} from 'src/services/constants';
import { View } from 'src/containers/view';
import { Stack } from 'src/abstract-data-types/stack/array';
import { getById } from 'src/utils/animation';
import {
	calculateArrowMatrix,
	calculateCursorCoords
} from 'src/utils/positioning';
import { AnimationBuildOptions } from 'src/utils/utils.interface';
import { HashMap } from 'react-move';

let idCounter: number = 1;

const nodeFactoryConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		position: Position.top
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
		this.getElementViewModelById = this.getElementViewModelById.bind(this);
		this.mapToAnimateAttrs = this.mapToAnimateAttrs.bind(this);
		this.buildExtendedAnimationStep =this.buildExtendedAnimationStep.bind(this);
	}

	public getAnimationBuildOptions(): AnimationBuildOptions {
		return {
			getElementViewModelById: this.getElementViewModelById,
			calculateByAttrs: this.mapToAnimateAttrs,
			rule: this.checkAnimationStep,
			extendStep: this.buildExtendedAnimationStep
		};
	}

	private checkAnimationStep(step): boolean {
		return Array.isArray(step.attrs.up);
	}

	private buildExtendedAnimationStep(step: HistoryStep): ElementAnimationStep[] {
		const emptyAttrs = {};
		const { up } = step.attrs;
		const nodeId = up[0] > up[1] ? up[0] : up[1];

		if (!up || up[0] === up[1]) {
			return [];
		}
		return up[1] === -1
			? this.state.nodes.map(node => (
				{
					id: node.id,
					ref: node.ref,
					action: TrackedActions.delete,
					attrs: emptyAttrs,
					previousState: null
				}
			))
			: [{
				id: nodeId,
				ref: getById<NodeViewModel<VType>>(this.state.nodes, nodeId).ref,
				action: up[0] > up[1] ? TrackedActions.delete : TrackedActions.new,
				attrs: emptyAttrs,
				previousState: null
			}];
	}

	public getElementViewModelById(step: HistoryStep): ElementViewModel {
		return step.id === 'up'
				? this.state.arrows[0]
				: getById(this.state.nodes, step.id);
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

		viewModel.arrows[0] = this.buildCursorViewModel(null, 'up');

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
	private mapToAnimateAttrs(id: number | string, attrs: HashMap): HashMap {
		const { up, ...other } = attrs;
		if (up === undefined) {
			return attrs;
		}

		const [ outPoint, inPoint ] = calculateCursorCoords(this.Node, up, Position.left);

		return {
			...other,
			transform: [`matrix(${calculateArrowMatrix(outPoint, inPoint).matrix})`]
		}
	}

	private buildCursorViewModel(nodeVM?: NodeViewModel<VType>,
                               existedArrowId?: number | string): ArrowViewModel {
		const id = existedArrowId || `link${idCounter++}`;
		const [ outCoords, inCoords ] = calculateCursorCoords(
			this.Node,
			nodeVM ? nodeVM.id : -1,
			Position.left
		);

		return {
			id,
			ref: React.createRef(),
			outCoords,
			inCoords,
			type: ArrowType.cursor
		};
	}
}
