import * as React from 'react';
import { Component, ReactNode } from 'react';
import {
	ADTView,
	ArrowViewModel,
	CallbackFunction,
	NodeFactory,
	NodeViewModel,
	Point,
	ViewModel
} from 'src/services/interface';
import {
	getById,
	getNodeCenterPoint,
} from 'src/utils/animation';
import animationStyles from 'src/services/animation-style';
import { Arrow } from 'src/components/arrow';
import { Animated } from 'src/containers/animated';
import { ArrowType, TrackedActions } from 'src/services/constants';
import { IAnimateProps } from 'react-move/Animate';
import { calculateArrowMatrix } from 'src/utils/positioning';
import { AnimationBuildOptions } from 'src/utils/utils.interface';

let idCounter: number = 1;

const enum RenderType {
	init,
	prerender,
	default
}

export abstract class View<M, VType>
		extends Component<object, ViewModel<VType>>
		implements ADTView<M, VType> {
	/**
	 * View component state.
	 * @public
	 */
	public state: ViewModel<VType>;
	/**
	 * Next calculated component state.
	 * @public
	 */
	public viewModel: ViewModel<VType>;
	/**
	 * Initial coordinates for structure view.
	 * @protected
	 * @readonly
	 */
	protected readonly INITIAL_COORDS: Point = null;
	/**
	 * Node component template is defined in instance of the derived class through a factory config.
	 */
	protected Node: NodeFactory;
	/**
	 * Render type indicates whether the render happens on component mount, pre-render operation
	 * or on apply a new view model. Type affects element style on first render.
	 */
	protected renderType: RenderType = RenderType.init;
	/**
	 * After initial render we should switch on default type for subsequent renders.
	 */
	public componentDidMount(): void {
		this.renderType = RenderType.default;
	}

	public render() {
		return (
				<g transform={`translate(${this.INITIAL_COORDS.x},${this.INITIAL_COORDS.y})`}>
					{...this.build()}
				</g>
		);
	}
	/**
	 * Build view model.
	 * View model element stores ref on node, its coordinates, in/out arrows ids.
	 * @protected
	 * @abstract
	 * @param model Structure model
	 */
	public abstract buildViewModel(model: M): void;
	public abstract getAnimationBuildOptions(): AnimationBuildOptions;

	public applyViewModel(cb?: CallbackFunction): void {
		this.setState(this.viewModel, typeof cb === 'function' && cb);
	}

	public prerender(cb?: CallbackFunction): void {
		this.renderType = RenderType.prerender;

		this.setState(this.viewModel, () => {
			this.renderType = RenderType.default;
			typeof cb === 'function' && cb();
		});
	}

	protected abstract buildInitialViewModel(): ViewModel<VType>;
	/**
	 * Build Node view model.
	 * @protected
	 * @abstract
	 * @param nodeM Node model
	 * @param parentVM Previous node view model
	 * @param opt Extra options for calculation
	 */
	protected abstract buildNodeViewModel(nodeM: any,
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
			inCoords: getNodeCenterPoint(inNodeVM.coords),
			type: ArrowType.link
		}
	}
	/**
	 * Build component representation of the structure.
	 * @protected
	 * @return Two dimension array, where
	 *         result[0] - Array of Animated Arrow components
	 *         result[1] - Array of Animated Node components
	 */
	protected build(): ReactNode[] {
		const { arrows, nodes } = this.state;
		const attrs = getAnimationAttrsByRenderType(this.renderType);

		return [
			this.buildArrowComponents(arrows, attrs),
			this.buildNodeComponents(nodes, attrs)
		];
	}
	/**
	 * Build array of Animated Arrow components.
	 * @protected
	 * @param arrows
	 * @param attrs
	 */
	protected buildArrowComponents(arrows: ArrowViewModel[], attrs: Partial<IAnimateProps>): JSX.Element[] {
		const defaultStyle = animationStyles[TrackedActions.default];

		return arrows.map(arrow => {
			const transformMatrix = `matrix(${calculateArrowMatrix(arrow.outCoords, arrow.inCoords).matrix})`;

			return (
				<Animated
					key={arrow.id}
					id={arrow.id}
					ref={arrow.ref}
					animationsAttrs={{
						start: {
							...attrs.start,
							fill: defaultStyle.fill,
							transform: transformMatrix
						},
						update: attrs.update ? {
							...defaultStyle,
							transform: [transformMatrix]
						} : null
					}}
				>
					<Arrow outPoint={arrow.outCoords} inPoint={arrow.inCoords} type={arrow.type} />
				</Animated>
			);
		});
	}
	/**
	 * Build array of Animated Node components.
	 * @protected
	 * @param nodes
	 * @param attrs
	 */
	protected buildNodeComponents(nodes: Array<NodeViewModel<VType>>, attrs: Partial<IAnimateProps>): JSX.Element[] {
		const defaultStyle = animationStyles[TrackedActions.default];

		return nodes.map(node => (
				<Animated
						key={node.id}
						id={node.id}
						ref={node.ref}
						animationsAttrs={{
							start: {
								...attrs.start,
								fill: defaultStyle.fill,
								x: node.coords.x,
								y: node.coords.y,
								value: node.value
							},
							update: attrs.update ? {
								...defaultStyle,
								x: [node.coords.x],
								y: [node.coords.y],
								value: node.value
							} : null
						}}
				>
					<this.Node.component />
				</Animated>
		))
	}
	/**
	 * Build animations queue.
	 * @protected
	 * @param viewModel
	 */
	// protected buildAnimationHistory(viewModel: ViewModel<VType>): AnimatedNode[] {
	// 	const routeHistory = this.routeHistory;
	// 	this.routeHistory = [];
	//
	// 	// TODO please, come up with a better idea
	// 	return routeHistory.reduce((hist, step, index) => {
	// 		const prevStep = index && routeHistory[index - 1];
	// 		const commonArrow: ArrowViewModel = prevStep && this.getCommonArrow(viewModel, prevStep[0].id, step[0].id);
	// 		const isSelectAction: boolean = step[1] === TRACKED_ACTIONS.SELECT;
	//
	// 		if (hist.length
	// 				&& prevStep[0].id === step[0].id
	// 				&& (prevStep[1] === step[1]
	// 						|| prevStep[1] !== TRACKED_ACTIONS.SELECT)) {
	// 			return hist;
	// 		}
	//
	// 		if (isSelectAction && commonArrow) {
	// 			hist.push({
	// 				ref: commonArrow.ref,
	// 				animationAttrs: arrowAnimationStates[TRACKED_ACTIONS.SELECT]
	// 			});
	// 		}
	// 		hist.push({
	// 			ref: getById(viewModel.nodes, step[0].id).ref,
	// 			animationAttrs: nodeAnimationStates[step[1]]
	// 		});
	// 		if (!isSelectAction && commonArrow) {
	// 			hist.push({
	// 				ref: commonArrow.ref,
	// 				animationAttrs: arrowAnimationStates[TRACKED_ACTIONS.INSERT]
	// 			});
	// 		}
	//
	// 		return hist;
	// 	}, []);
	// }
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
	 * Get View component initial state.
	 * @protected
	 */
	protected getViewInitialState(): ViewModel<VType> {
		return {
				nodes: [],
				arrows: []
		}
	}
}

/**
 * Initial render: all elements are visible.
 * Pre-render: new mounted elements are invisible, existed nodes don't update.
 * Default render: update all elements.
 * @param type
 */
function getAnimationAttrsByRenderType(type: RenderType): Partial<IAnimateProps> {
	const value = Number(type === RenderType.init);

	return {
		start: {
			opacity: value,
			scale: value
		},
		update: type !== RenderType.prerender
	}
}