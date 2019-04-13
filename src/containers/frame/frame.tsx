import React, {
	MutableRefObject,
	ReactNode,
	FunctionComponent
} from 'react';
import { VMC } from 'src/services/interface';
import { Canvas } from 'src/components/canvas';
import { bindTracker } from 'src/services/tracker';
import { ViewModelController } from 'src/services/view-model-controller';
import { AnimationController } from 'src/services/animation-controller';
import { AnimationControl } from 'src/components/animation-control';
import { AbstractionConfig } from 'src/containers/adt';
import './frame.css';
import { View } from 'src/containers/view';

export interface FrameProps {
	title: ReactNode
}

export class Frame<M, V extends View<M, any>> {

	public ViewModelController: VMC;
	public AnimationController: AnimationController;

	private model: M;
	private View: V;
	private viewRef: MutableRefObject<any> = React.createRef();

	constructor(config: AbstractionConfig) {
		this.AnimationController = new AnimationController();

		this.View = config.view;
		this.model = bindTracker(
				new config.model(),
				config.trackedProps,
				config.trackHandler(this.AnimationController.trace)
		);

		this.component = this.component.bind(this);
	}

	public component() {
		const { View }: any = this;

		return (
			<section className="frame">
				<header className="frame__header">
					<Breadcrumbs chain={['stack', 'array']} />
					<AnimationControl className="frame__controls" />
				</header>
				<Canvas>
					<View
						ref={ref => {
							this.viewRef.current = ref;
							this.ViewModelController = new ViewModelController(this.model, this.viewRef.current);
						}}
					/>
				</Canvas>
			</section>
		);
	}
}
