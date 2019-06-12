import { SubsequentNodeFactory, SubsequentNodeFactoryConfig } from 'src/services/node-factory';
import { ArrowType, CursorOptions, Direction, FieldType, Position, TrackedActions } from 'src/services/constants';
import { View } from 'src/containers/view';
import { Element, propertyKeyMatchesId, Stack, } from 'src/abstract-data-types/stack/linked-list';
import {
	AnimationHistoryStep,
	ArrowViewModel,
	ElementAnimationStep,
	ElementViewModel,
	HistoryStep,
	NodeViewModel,
	Point,
	ViewModel
} from 'src/services/interface';
import {
	calculateArrowMatrix,
	calculateCursorCoords, calculateLinkCoords,
	calculatePointByOffsetPosition, getDirectionByPosition,
	getReversePosition
} from 'src/utils/positioning';
import React from 'react';
import { AnimationBuildOptions } from 'src/utils/utils.interface';
import { getById } from 'src/utils/animation';
import { HashMap } from 'react-move';
import { AnimationHistory } from 'src/services/animation-history';

let idCounter: number = 1;
const emptyAttrs = {};

const nodeFactoryConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		position: Position.right
	},
	node: {
		fields: {
			value: FieldType.value,
			next: FieldType.ref
		},
		direction: Direction.horizontal,
		offset: 30
	}
};

export class LinkedListView<VType> extends View<Stack<VType>, VType> {

	protected Node = new SubsequentNodeFactory(nodeFactoryConfig);

	protected getInitialCoords(): Point {
		return {
			x: 2 * this.Node.width,
			y: this.props.dimension.height / 2
		}
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
			extendStep: this.buildExtendedAnimationStep
		};
	}

	private buildExtendedAnimationStep(step: HistoryStep, vm: ElementViewModel): ElementAnimationStep[] {
		const { id, attrs } = step;
		const { arrows } = this.state;

		if (id === 'Element') {
			if (!attrs.Element.next) {
				return [];
			}
			const { outArrows } = vm as NodeViewModel<VType>;
			const linkCoords = calculateLinkCoords(this.Node, -1, 'next', 0);
			return outArrows && [
					this.buildActionStep(
						getById(arrows, outArrows[0]),
						TrackedActions.new,
						{
							transform: `matrix(${calculateArrowMatrix(...linkCoords).matrix})`
						}
				)
			];
		}

		if (id === 'delete') {
			return attrs[id].bulkType
				? this.deleteAllNodes(this.state)
				: this.deleteNode(this.state, vm as NodeViewModel<VType>);
		}

		return []
	}

	private buildActionStep(elementVM: ElementViewModel, action?: TrackedActions, attrs?: HashMap): ElementAnimationStep {
		return {
			id: elementVM.id,
			ref: elementVM.ref,
			action: action || TrackedActions.delete,
			attrs: attrs || emptyAttrs,
			previousState: null
		}
	}

	private deleteAllNodes(vm: ViewModel<VType>): ElementAnimationStep[] {
		const { arrows, nodes } = vm;
		const arrowsAmount = arrows.length;
		const steps = [];

		for (let i = propertyKeyMatchesId.length; i < arrowsAmount; i++) {
			steps.push(this.buildActionStep(arrows[i]));
		}

		return steps.concat(nodes.map(
				nodeVM =>this.buildActionStep(nodeVM)
		));
	}

	private deleteNode(vm: ViewModel<VType>, nodeVM: NodeViewModel<VType>): ElementAnimationStep[] {
		const { arrows } = vm;
		const { outArrows = [], inArrows = [] } = nodeVM;

		return outArrows
			.concat(inArrows)
			.map(arrowId => this.buildActionStep(getById(arrows, arrowId)));
	}

	public getElementViewModelById(step: HistoryStep): ElementViewModel {
		const { id: stepId, attrs } = step;
		const id: number | string = typeof stepId === 'number' || ~(propertyKeyMatchesId.indexOf(stepId))
			? stepId
			: attrs[stepId].id;
		const container = typeof id === 'number' ? this.state.nodes : this.state.arrows;

		return getById(container, id);
	}

	protected buildInitialViewModel(): ViewModel<VType> {
		const viewModel	= this.getViewInitialState();

		viewModel.arrows[0] = this.buildCursorViewModel(null, 'head');

		return viewModel;
	}

	protected buildNodeViewModel(nodeM: Element<VType>,
                               parentVM: NodeViewModel<VType>,
                               position: number): NodeViewModel<VType> {
		const { id, value } = nodeM;

		return {
			id,
			ref: React.createRef(),
			value,
			coords: this.Node.getNodeCoords(position)
		};
	}

	buildViewModel(model: Stack<VType>, history?: HistoryStep[]): void {
		const { head } = model;
		let temp: Element<VType> = head;
		let outNodeVM: NodeViewModel<VType>;
		let inNodeVM: NodeViewModel<VType>;
		let position = 0;

		this.viewModel = this.getViewInitialState();
		const { nodes, arrows } = this.viewModel;
		const cursorVM = this.state.arrows[0];

		// head cursor
		arrows[0] = this.buildCursorViewModel(null, cursorVM && cursorVM.id);

		if (temp) {
			outNodeVM = nodes[position] = this.buildNodeViewModel(temp, null, position++);
			temp = temp.next;
		}

		while (temp) {
			inNodeVM = nodes[position] = this.buildNodeViewModel(temp, null, position);
			arrows.push(
				this.buildArrowViewModel(
					outNodeVM,
					inNodeVM,
					getCommonArrowId(this.state, outNodeVM.id, inNodeVM.id, history, 'next'),
					'next',
					position - 1
				)
			);
			temp = temp.next;
			outNodeVM = inNodeVM;
			position++;
		}
	}

	private buildCursorViewModel(nodeVM?: NodeViewModel<VType>,
                               existedArrowId?: number | string): ArrowViewModel {
		const id = existedArrowId || `link${idCounter++}`;
		const [ outCoords, inCoords ] = calculateCursorCoords(
				this.Node,
				nodeVM ? nodeVM.id : 0,
				Position.top
		);

		return {
			id,
			ref: React.createRef(),
			outCoords,
			inCoords,
			type: ArrowType.cursor
		};
	}

	private mapToAnimateAttrs(id: number | string, attrs: HashMap, animationTrace: AnimationHistory): HashMap {
		const { head, Element: elem, next, ...other } = attrs;

		if (head !== undefined) {
			const [ outPoint, inPoint ] = calculateCursorCoords(
				this.Node,
				!head ? 0 : getNodeCalculatedCoords(head.id, this.previousViewModel, animationTrace)
			);
			return {
				transform: [`matrix(${calculateArrowMatrix(outPoint, inPoint).matrix})`]
			};
		}

		if (elem) {
			return { ...this.Node.getNodeCoords(-1) }
		}

		return { ...other };
	}

	protected buildResponsiveViewModel(totalVM: ViewModel<VType>): ViewModel<VType> {
		return totalVM;
	}
}

function getNodeCalculatedCoords(id: number | string, vm: ViewModel<{}>, animationTrace: AnimationHistory): Point {
	const iterator = animationTrace[Symbol.iterator](animationTrace.history.length - 1, 0);
	let nodeCoords: Point = null;
	let element: ElementAnimationStep = null;
	let attrs: HashMap = null;
	console.log(animationTrace);
	// Search in the built animation history
	for (let nextElement = iterator.next(); !nodeCoords && !nextElement.done; nextElement = iterator.next()) {
		element = nextElement.value;
		attrs = element.attrs;
		// If step stores node coords
		if (element.id === id && attrs.x) {
			nodeCoords = {
				x: attrs.x,
				y: attrs.y
			}
		}
	}
	// Search in view model
	return nodeCoords ? nodeCoords : getById<NodeViewModel<{}>>(vm.nodes, id).coords;
}

function getCommonArrowId(viewModel: ViewModel<{}>,
                          outNodeId: number,
                          inNodeId: number,
                          history: HistoryStep[],
                          fieldName: string): number | string {
	const { nodes, arrows } = viewModel;
	const outNodeVM: NodeViewModel<{}> = getById(nodes, outNodeId);
	const cache: { [key in (string | number)]: ArrowViewModel } = {};
	// There was no arrow before.
	if (!outNodeVM || !outNodeVM.outArrows) {
		return null;
	}
	// Check if arrow exists and it wasn't changed.
	for (const arrowId of outNodeVM.outArrows) {
		const arrowVM: ArrowViewModel = cache[arrowId] = getById(arrows, arrowId);
		cache[arrowId] = arrowVM;
		if (arrowVM.inNode === inNodeId) {
			return arrowId;
		}
	}
	// If arrow was changed.
	const step = history.find(({ id, attrs }) =>
			id === outNodeId && Array.isArray(attrs[fieldName])
	);

	return step
		? outNodeVM.outArrows.find(id =>
			cache[id].inNode === step.attrs[fieldName][0]
		)
		: null;
}
