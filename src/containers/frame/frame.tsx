import React, { MutableRefObject } from 'react';
import {
	AC, VMC,
	ADTView,
	ViewFrame,
	TrackedClassItem
} from 'src/services/interface';
import { Canvas } from 'src/components/canvas';
import { bindTracker } from 'src/services/tracker';
import { ViewModelController } from 'src/services/view-model-controller';
import { AnimationController } from 'src/services/animation-controller';
import { AnimationControl } from 'src/components/animation-control';
import { Breadcrumbs } from 'src/components/breadcrumbs';

export class Frame<M, V extends ADTView<M, any>> implements ViewFrame<M, V> {

	public ViewModelController: VMC;
	public AnimationController: AC;

	private model: M;
	private View: V;
	private viewRef: MutableRefObject<V> = React.createRef();

	constructor(Model: new () => M, trackedItems: TrackedClassItem[], View: any) {
		this.AnimationController = new AnimationController();

		this.View = View;
		this.model = bindTracker(
				new Model(),
				trackedItems,
				View.onTrack.bind(null, this.AnimationController.history)
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
