import * as React from 'react';
import {
	ModelAction,
	Point,
	ViewModel,
	NodeViewModel,
	AnimatedNode,
} from 'src/services/interface';
import { animateQueue, getById } from 'src/services/helpers';
import { bindTracker } from 'src/services/tracker';
import { NODE_OPTIONS } from 'src/services/constants';
import { View } from 'src/containers/view';
import {
	BST,
	BstTrackedItems,
	BstRef,
	NodeRef
} from 'src/data-structures/bst';

type VType = number;

export class BSTView extends View<BstRef<VType>, NodeRef<VType>, VType> {
	/**
	 * Initial coordinates for structure view.
	 * @protected
	 * @readonly
	 */
	protected readonly INITIAL_COORDS: Point = { // TODO check coords. make them relative to the VP
		x: 650,
		y: 0
	};
	/**
	 * Create BSTView instance and initialize state.
	 * @constructor
	 */
	constructor(props) {
		super(props);
		this.state.model = bindTracker(new BST<VType>(), BstTrackedItems, this.onTrackedAction.bind(this));
	}
	/**
	 * Update view model when adding new node to the structure:
	 * 1. update model
	 * 2. build view model
	 * 3. rerender tree with opacity:0 for new components && build animations queue
	 * 4. after rerender play animations queue
	 * @public
	 * @abstract
	 * @param value
	 */
	public onInsertUpdate(value: VType) {
		this.isModelUpdating = true;
		const flag: number = this.state.model.insert(value);
		this.isModelUpdating = false;
		if (flag === BST.OUT_OF_DOMAIN) {
			return;
		}

		const viewModel: ViewModel<VType> = this.buildViewModel(this.state.model);
		let animHistory: AnimatedNode[];

		if (this.animationsQueueDefer) {
			this.animationsQueueDefer.reject();
			this.animationsQueueDefer = null;
		}

		this.setState({
					model: this.state.model,
					viewModel
				},
				() => {
					this.animationsQueueDefer = animateQueue(animHistory);
					this.animationsQueueDefer
							.promise
							.then(() => {
								this.animationsQueueDefer = null;
								// this.forceUpdate();
							});
				}
		);

		animHistory = this.buildAnimationHistory(viewModel);
	}
	/**
	 * Build BSTView model.
	 * View model element stores ref on node, its coordinates, in/out arrows ids.
	 * @protected
	 * @abstract
	 * @param model BST model
	 */
	protected buildViewModel(model: BstRef<VType>): ViewModel<VType> {
		const treeHeight = model.getTreeHeight();
		const root = model.getRoot();
		const vm = this.getViewInitialState().viewModel;

		if (!root) {
			return vm;
		}

		const power = 2 ** (treeHeight - 1);
		const treePxWidth = NODE_OPTIONS.WIDTH * power + NODE_OPTIONS.MARGIN * (power - 1);
		let subtreePxWidth = treePxWidth / 2;

		const stack: any[] = [];
		let nodeM: any = root;
		let nodeVM: NodeViewModel<VType> = null;
		let existedVM: any = null;
		let parentVM: NodeViewModel<VType> = null;

		while (nodeM || stack.length) {
			if (stack.length) {
				nodeM = stack.pop();
				if (!stack.length) {
					break;
				}
				if (nodeM.right === stack[stack.length - 1]) {
					nodeM = stack.pop();
				}
				else {
					const parentId: number = stack[stack.length - 1].id;
					parentVM = getById(vm.nodes, parentId);
					nodeVM = getById(vm.nodes, nodeM.id);
					existedVM = this.state.viewModel.arrows.find(arrow =>
							arrow.outNode === parentId && arrow.inNode === nodeM.id
					);
					vm.arrows.push(this.buildArrowViewModel(parentVM, nodeVM, existedVM && existedVM.id));
					subtreePxWidth *= 2;
					nodeM = null;
				}
			}

			while (nodeM) {
				existedVM = getById(this.state.viewModel.nodes, nodeM.id);
				nodeVM = this.buildNodeViewModel(nodeM, parentVM, subtreePxWidth);
				if (existedVM != null) {
					nodeVM = { ...existedVM, ...nodeVM };
				}
				vm.nodes.push(nodeVM);

				stack.push(nodeM);
				if (nodeM.right) {
					stack.push(nodeM.right);
					stack.push(nodeM);
				}

				parentVM = nodeVM;
				nodeM = nodeM.left;
				subtreePxWidth /= 2;
			}
		}

		return vm;
	}
	/**
	 * Build Node view model.
	 * @protected
	 * @param nodeM Node model
	 * @param parentVM Previous(parent) node view model
	 * @param subtreePxWidth Offset on Y axis from root node
	 */
	protected buildNodeViewModel(nodeM: NodeRef<VType>,
	                             parentVM: NodeViewModel<VType>,
	                             subtreePxWidth: number): NodeViewModel<VType> {
		const { id, value } = nodeM;
		const coords = parentVM ? parentVM.coords : null;

		return {
			id,
			ref: React.createRef(),
			value,
			coords: !parentVM
				? { x: 0, y: 0 }
				: {
					x: parentVM.value > value
							? coords.x - subtreePxWidth
							: coords.x + subtreePxWidth,
					y: coords.y + NODE_OPTIONS.HEIGHT + NODE_OPTIONS.MARGIN
				}
		};
	}
}

/**
 * Interface for working with BST structure.
 */
export const BstInterface: ModelAction[] = [
	{
		name: 'Insert',
		method: 'onInsertUpdate'
	},
	{
		name: 'Remove',
		method: 'onInsertUpdate'
	},
	{
		name: 'Search',
		method: 'onInsertUpdate'
	}
];
