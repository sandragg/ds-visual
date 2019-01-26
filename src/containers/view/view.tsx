import * as React from 'react';
import {
	Point,
	InitialState,
	ViewModel,
	ArrowViewModel,
	NodeViewModel,
	AnimatedNode,
	PromiseDefer, TrackedItemOption
} from 'src/services/interface';
import {
	calcArrowMatrix,
	getNodeCenterPoint,
	getById
} from 'src/services/helpers';
import { TRACKED_ACTIONS } from 'src/services/constants';
import {
	arrowAnimationStates,
	nodeAnimationStates
} from 'src/services/animation-style';
import { Node as NodeView } from 'src/components/node';
import { Arrow } from 'src/components/arrow';
import { Animated } from 'src/containers/animated';

let idCounter: number = 1;

export abstract class View<M, N, VType> extends React.Component<object, InitialState<M, VType>> {
	/**
	 * View component state.
	 * @public
	 */
	public state: InitialState<M, VType> = null;
	/**
	 * Deferred promise for animations queue.
	 * @protected
	 */
	protected animationsQueueDefer: PromiseDefer = null;
	/**
	 * Initial coordinates for structure view.
	 * @protected
	 * @readonly
	 */
	protected readonly INITIAL_COORDS: Point = null;
	/**
	 * Store route steps from structure traversal.
	 * @protected
	 */
	protected routeHistory: any[] = [];
	/**
	 * Flag is true, if a structure model is updating now.
	 * @protected
	 */
	protected isModelUpdating: boolean = false;
	/**
	 * Create View model instance and initialize state.
	 * @protected
	 * @constructor
	 */
	protected constructor(props) {
		super(props);
		this.state = this.getViewInitialState();
	}
	/**
	 * Render structure view model.
	 * @public
	 */
	public render() {
		return (
				<g transform={`translate(${this.INITIAL_COORDS.x},${this.INITIAL_COORDS.y})`}>
					{...this.build()}
				</g>
		);
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
	public abstract onInsertUpdate(value: VType);
	/**
	 * Build view model.
	 * View model element stores ref on node, its coordinates, in/out arrows ids.
	 * @protected
	 * @abstract
	 * @param model Structure model
	 */
	protected abstract buildViewModel(model: M): ViewModel<VType>;
	/**
	 * Build Node view model.
	 * @protected
	 * @abstract
	 * @param nodeM Node model
	 * @param parentVM Previous node view model
	 * @param opt Extra options for calculation
	 */
	protected abstract buildNodeViewModel(nodeM: N,
	                                      parentVM: NodeViewModel<VType>,
	                                      opt: any): NodeViewModel<VType>;
	/**
	 * Build Arrow view model.
	 * @protected
	 * @param outNodeVM Outgoing node view model
	 * @param inNodeVM Incoming node view model
	 * @param existedArrowId
	 */
	protected buildArrowViewModel(outNodeVM: NodeViewModel<VType>,
	                              inNodeVM: NodeViewModel<VType>,
	                              existedArrowId: number ): ArrowViewModel { // TODO smth strange
		const id = existedArrowId || idCounter++;

		if (!outNodeVM.outArrows) {
			outNodeVM.outArrows = [];
		}
		outNodeVM.outArrows.push(id);
		if (!inNodeVM.inArrows) {
			inNodeVM.inArrows = [];
		}
		inNodeVM.inArrows.push(id);

		return {
			id,
			ref: React.createRef(),
			outNode: outNodeVM.id,
			outCoords: getNodeCenterPoint(outNodeVM.coords),
			inNode: inNodeVM.id,
			inCoords: getNodeCenterPoint(inNodeVM.coords)
		}
	}
	/**
	 * Build component representation of the structure.
	 * @protected
	 * @return Two dimension array, where
	 *         result[0] - Array of Animated Arrow components
	 *         result[1] - Array of Animated Node components
	 */
	protected build(): JSX.Element[][] {
		const { arrows, nodes } = this.state.viewModel;

		return [
			this.buildArrowComponents(arrows),
			this.buildNodeComponents(nodes)
		];
	}
	/**
	 * Build array of Animated Arrow components.
	 * @protected
	 * @param arrows
	 */
	protected buildArrowComponents(arrows: ArrowViewModel[]): JSX.Element[] { // TODO mb squash buildArrow and buildNode ???
		return arrows.map(arrow => (
				<Animated
						key={arrow.id}
						ref={arrow.ref}
						animationsAttrs={{
							start: {
								opacity: 0,
								scale: 0,
								transform: `matrix(${calcArrowMatrix(arrow.outCoords, arrow.inCoords).matrix})`
							},
							update: {
								...arrowAnimationStates[TRACKED_ACTIONS.DEFAULT],
								transform: [`matrix(${calcArrowMatrix(arrow.outCoords, arrow.inCoords).matrix})`]
							}
						}}
				>
					<Arrow outPoint={arrow.outCoords} inPoint={arrow.inCoords} />
				</Animated>
		))
	}
	/**
	 * Build array of Animated Node components.
	 * @protected
	 * @param nodes
	 */
	protected buildNodeComponents(nodes: Array<NodeViewModel<VType>>): JSX.Element[] {
		return nodes.map(node => (
				<Animated
						key={node.id}
						ref={node.ref}
						animationsAttrs={{
							start: {
								opacity: 0,
								scale: 0,
								x: node.coords.x,
								y: node.coords.y
							},
							update: {
								...nodeAnimationStates[TRACKED_ACTIONS.DEFAULT],
								x: [node.coords.x],
								y: [node.coords.y]
							}
						}}
				>
					<NodeView>{node.value}</NodeView>
				</Animated>
		))
	}
	/**
	 * Build animations queue.
	 * @protected
	 * @param viewModel
	 */
	protected buildAnimationHistory(viewModel: ViewModel<VType>): AnimatedNode[] {
		const routeHistory = this.routeHistory;
		this.routeHistory = [];

		// TODO please, come up with a better idea
		return routeHistory.reduce((hist, step, index) => {
			const prevStep = index && routeHistory[index - 1];
			const commonArrow: ArrowViewModel = prevStep && this.getCommonArrow(viewModel, prevStep[0].id, step[0].id);
			const isSelectAction: boolean = step[1] === TRACKED_ACTIONS.SELECT;

			if (hist.length
					&& prevStep[0].id === step[0].id
					&& (prevStep[1] === step[1]
							|| prevStep[1] !== TRACKED_ACTIONS.SELECT)) {
				return hist;
			}

			if (isSelectAction && commonArrow) {
				hist.push({
					ref: commonArrow.ref,
					animationAttrs: arrowAnimationStates[TRACKED_ACTIONS.SELECT]
				});
			}
			hist.push({
				ref: getById(viewModel.nodes, step[0].id).ref,
				animationAttrs: nodeAnimationStates[step[1]]
			});
			if (!isSelectAction && commonArrow) {
				hist.push({
					ref: commonArrow.ref,
					animationAttrs: arrowAnimationStates[TRACKED_ACTIONS.INSERT]
				});
			}

			return hist;
		}, []);
	}
	/**
	 * Get common arrow view model between two nodes.
	 * @protected
	 * @param viewModel Current or new view model if state is updating now.
	 * @param outNodeId Outgoing node view model
	 * @param inNodeId Incoming node view model
	 */
	protected getCommonArrow(viewModel: ViewModel<VType>, outNodeId: number, inNodeId: number): ArrowViewModel {
		const { nodes, arrows } = viewModel;
		const parentVM = getById(nodes, outNodeId);

		if (!parentVM || !parentVM.outArrows) {
			return null;
		}
		for (const arrowId of parentVM.outArrows) { // TODO check linked nodes
			const arrowVM = getById(arrows, arrowId);
			if (arrowVM.inNode === inNodeId) {
				return arrowVM;
			}
		}

		return null;
	}
	/**
	 * Callback for bindTracker.
	 * @protected
	 * @param res Operation result
	 * @param opt Extra tracking options
	 */
	protected onTrackedAction(res: any, opt: TrackedItemOption) {
		if (res != null && this.isModelUpdating) {
			this.routeHistory.push([res, opt]);
		}
	}
	/**
	 * Get View component initial state.
	 * @protected
	 */
	protected getViewInitialState(): InitialState<M, VType> {
		return {
			model: null,
			viewModel: {
				nodes: [],
				arrows: []
			}
		}
	}
}
