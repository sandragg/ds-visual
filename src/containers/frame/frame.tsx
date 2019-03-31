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

export class Frame<M, V extends ADTView<M, any>> implements ViewFrame<M, V> {

	public ViewModelControl: VMC;
	public AnimationControl: AC;

	private model: M;
	private View: V;
	private viewRef: MutableRefObject<V> = React.createRef();

	get view() {
		return this.viewRef.current;
	}

	constructor(Model: new () => M, trackedItems: TrackedClassItem[], View: any) {
		this.AnimationControl = new AnimationController();

		this.View = View;
		this.model = bindTracker(
				new Model(),
				trackedItems,
				View.onTrack.bind(null, this.AnimationControl.history)
		);

		this.component = this.component.bind(this);
	}

	public component() {
		const { View }: any = this;

		return (
			<Canvas>
				<View
					ref={ref => {
						this.viewRef.current = ref;
						this.ViewModelControl = new ViewModelController(this.model, this.viewRef.current);
					}}
				/>
			</Canvas>
		);
	}
}
