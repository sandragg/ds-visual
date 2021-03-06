import React, {
	MutableRefObject,
	ReactNode,
	FunctionComponent
} from 'react';
import { Canvas } from 'src/components/canvas';
import { ViewModelController } from 'src/services/view-model-controller';
import { AnimationController } from 'src/services/animation-controller';
import { AnimationControl } from 'src/components/animation-control';
import { AbstractionConfig } from 'src/containers/adt';
import './frame.css';
import { View } from 'src/containers/view';
import { IconButton } from 'src/components/button';
import { ExternalLinkIcon } from 'src/components/icons';
import { TrackedModel } from 'src/services/tracked-model';

export interface FrameProps {
	title: ReactNode,
	id: number,
	onFullScreenOpen(indexes: Set<number>): void
}

export class Frame<M, V extends View<M, any>> {

	public ViewModelController: ViewModelController<M, V>;
	public AnimationController: AnimationController;
	public name: string;

	private readonly model: TrackedModel<M>;
	private readonly View: V;
	private viewRef: MutableRefObject<any> = React.createRef();

	constructor(config: AbstractionConfig) {
		this.name = config.name;
		this.View = config.view;
		this.model = new TrackedModel<M>(config);
		this.AnimationController = new AnimationController(this.model);
	}

	public component: FunctionComponent<FrameProps> = (props) => {
		const { title, id, onFullScreenOpen } = props;
		const StructureView: any = this.View;

		return (
			<section className="frame">
				<header className="frame__header">
					<div className="title-container">
						{title}
						<IconButton
								className="frame__external-link"
								onClick={() => onFullScreenOpen(new Set([id]))}
						>
							<ExternalLinkIcon />
						</IconButton>
					</div>
					<AnimationControl className="frame__controls"
            onBack={() => this.AnimationController.rewind(this.AnimationController.activeStep - 1)}
            onForward={() => this.AnimationController.rewind(this.AnimationController.activeStep + 1)}
						onPlay={this.AnimationController.play}
						onPause={this.AnimationController.pause}
						onRewind={this.AnimationController.rewind}
					/>
				</header>
				<Canvas onResize={this.AnimationController.reset} >
					<StructureView
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
