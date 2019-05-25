import React, {
	useRef,
	useCallback,
	useState,
	useMemo
} from 'react';
import { Button } from 'src/components/button';
import {
	ModelAction,
	ValidationResponse
} from 'src/services/interface';
import { Frame } from 'src/containers/frame';
import { ADTConfig } from 'src/containers/adt';
import 'src/App.css';
import './visualization-page.css';
import { Breadcrumbs } from 'src/components/breadcrumbs';
import { SideBar } from 'src/components/sidebar';
import { FramesConfiguration } from 'src/containers/frames-configuration';
import { AnimationControl } from 'src/components/animation-control';
import { ViewModelController } from 'src/services/view-model-controller';
import { AnimationController } from 'src/services/animation-controller';

export const VisualizationPage = (props: { config: ADTConfig }) => {
	const { config: { abstractions }, config } = props;

	const [ selectedViewsIndexes, setSelectedViewsIndexes ] = useState<Set<number>>(new Set([0]));
	const frames = useRef<{ [key: number]: Frame<any, any> }>({ 0: new Frame(abstractions[0]) });
	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLOutputElement>(null);
	const applyToAll = useMemo(
		() => promiseAll<Frame<any, any>>(Object.values(frames.current)),
		[frames.current]
	);

	const updateConfiguration = useCallback(
		(indexes) => {
			frames.current = {};
			for (const index of indexes) {
				frames.current[index] = new Frame(abstractions[index]);
			}
			setSelectedViewsIndexes(indexes);
		},
			[]
	);

	const toggleDisplayMessage = useCallback(
		(result?: string) => {
			if (result != null) {
				outputRef.current.hidden = false;
				outputRef.current.value = result;
			}
			else {
				outputRef.current.hidden = true;
				inputRef.current.value = '';
			}
		},
		[]
	);

	const callOperation = useCallback(
		(action: ModelAction) => {
			const {
				params,
				isValid,
				errorText
			} = config.deriveAndValidateParams(action, [inputRef.current.value]); // need to implement for multiple params

			if (!isValid) {
				toggleDisplayMessage(errorText);
				return;
			}
			toggleDisplayMessage();
			actionHandler(frames.current, action, params || [], config.validateOperation(action.method), toggleDisplayMessage);
		},
		[frames]
	);

	const onPlay = useCallback(
		() => applyToAll(frame => frame.AnimationController.play()),
		[applyToAll]
	);
	const onPause = useCallback(
			() => applyToAll(frame => frame.AnimationController.pause()),
			[applyToAll]
	);
	const onRewind = useCallback(
			(step: number) => applyToAll(frame => frame.AnimationController.rewind(step)),
			[applyToAll]
	);

	return (
		<>
			<section className="section visualization-section">
				{Object.keys(frames.current).map(key => {
					const frame = frames.current[key];
					return (
						<frame.component
							key={frame.name}
							id={Number(key)}
							title={<Breadcrumbs chain={[config.name, frame.name]} />}
							onFullScreenOpen={updateConfiguration}
						/>
					);
				})}
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
				{selectedViewsIndexes.size > 1 && (
					<output
						className="toolbar__animation"
					>
						<AnimationControl
							className="toolbar__controls"
							onPlay={onPlay}
							onPause={onPause}
							onRewind={onRewind}
						/>
					</output>
				)}
				{
					config.interface.map((action: ModelAction) => (
						<Button
							key={action.name}
							className="toolbar__button"
							theme="orng"
							onClick={() => callOperation(action)}
						>
							{action.name}
						</Button>
					))
				}
			</section>

			<SideBar>
				<FramesConfiguration
					abstractions={config.abstractions}
					selectedViewsIndexes={selectedViewsIndexes}
					onUpdate={updateConfiguration}
				/>
			</SideBar>
		</>
	);
};

type FrameControllers = [ ViewModelController<any, any>, AnimationController ];

function actionHandler(frames: { [key: string]: Frame<any, any> },
                       action: ModelAction,
                       params: any[],
                       validateOperation: (model: any) => ValidationResponse,
                       actionResultHandler: Function): void {
	const controllers = Object.keys(frames).map(
		key => [
			frames[key].ViewModelController,
			frames[key].AnimationController
		]
	) as FrameControllers[];
	const applyToAll = promiseAll<FrameControllers>(controllers);
	let validationResponse: ValidationResponse = null;
	// Reset frames
	controllers.forEach(ctrl => ctrl[1].reset());
	const renderPromise = applyToAll(ctrl => ctrl[0].render());
	// Validation
	controllers.some(ctrl => {
		validationResponse = ctrl[0].validateModelOperation(validateOperation);
		return validationResponse.isValid;
	});
	if (!validationResponse.isValid) {
		actionResultHandler(validationResponse.errorText);
		return;
	}
	// Build models and start animation
	renderPromise
		.then(() => applyToAll(
			ctrl => ctrl[0].build(action, params)
		))
		.then(res => {
			actionResultHandler(res[0]);
			return action.prerender && applyToAll(ctrl => ctrl[0].prerender())
		})
		.then(() => applyToAll(ctrl => ctrl[1].build(ctrl[0].view.getAnimationBuildOptions())))
		.then(() => applyToAll(ctrl => ctrl[1].play()))
		.then(res => console.log('res', res))
		.catch(err => console.log('err', err));
}

function promiseAll<T = any>(
		collection: T[]
): (handler: (value: T, ...args: any) => PromiseLike<any> | void) => Promise<any[]> {
	return handler => Promise.all(collection.map(handler));
}