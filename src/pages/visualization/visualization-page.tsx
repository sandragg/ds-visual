import React, {
	useRef,
	useCallback
} from 'react';
import { Button } from 'src/components/button';
import {
	ModelAction,
	ValidationResponse,
	ViewFrame
} from 'src/services/interface';
import { Frame } from 'src/containers/frame';
import { ADTConfig } from 'src/containers/adt';
import 'src/App.css';
import './visualization-page.css';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { View } from 'src/containers/view';

// TODO DRAFT VARIANT. Should be adapted for multiple frames + there will be a side bar with frames control.
export const VisualizationPage = (props: { config: ADTConfig }) => {
	const { config } = props;
	const struct = config.abstractions[0];

	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLOutputElement>(null);
	const frame = useRef<Frame<object, View<object, number>>>(new Frame(struct));
	const FrameComponent = frame.current.component;

	const showResult = useCallback(
		(result: any) => {
			if (result != null) {
				outputRef.current.hidden = false;
				outputRef.current.value = result;
			}
		},
		[]
	);

	return (
		<>
			<section className="section visualization-section">
				<FrameComponent
					title={<Breadcrumbs chain={[config.name, struct.name]} />}
				/>
			</section>
			<section className="section toolbar">
				<output
					ref={outputRef}
					className="toolbar__output"
					hidden
				/>
				<input
					ref={inputRef}
					className="toolbar__input"
					type="number"
					placeholder="Enter the number"
				/>
				<output
					className="toolbar__animation"
				>
					Animation controls
				</output>
				{
					config.interface.map((action: ModelAction) => (
						<Button
							key={action.name}
							className="toolbar__button"
							theme="orng"
							onClick={() => {
								const {
									params,
									isValid,
									errorText
								} = config.deriveAndValidateParams(action, [inputRef.current.value]);

								if (!isValid) {
									outputRef.current.hidden = false;
									outputRef.current.value = errorText;
									return;
								}
								outputRef.current.hidden = true;
								inputRef.current.value = '';

								actionHandler(frame.current, action, params, config.validateOperation, showResult);
							}}
						>
							{action.name}
						</Button>
					))
				}
			</section>
		</>
	);
};

function actionHandler(frame: ViewFrame<any, any>,
                       action: ModelAction,
                       params: any[],
                       validateOperation: (operation: string) => (model: any) => ValidationResponse,
                       actionResultHandler: Function): void {
	const FrameAC = frame.AnimationController;
	const FrameVMC = frame.ViewModelController;

	FrameAC.reset();
	const renderPromise = FrameVMC.render();
	const { isValid, errorText } = FrameVMC.validateModelOperation(validateOperation(action.method));

	if (!isValid) {
		actionResultHandler(errorText);
		return;
	}

	renderPromise
		.then(() => FrameVMC.build(action, params, FrameAC.toggleHistoryStatus))
		.then(res => {
			actionResultHandler(res);
			return action.prerender && FrameVMC.prerender();
		})
		.then(() => FrameAC.build(FrameVMC.view.getAnimationBuildOptions()))
		.then(() => FrameAC.play())
		.then(res => console.log('res', res))
		.catch(err => console.log('err', err));
}
