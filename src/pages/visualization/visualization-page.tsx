import React, {
	useMemo,
	useRef
} from 'react';
import 'src/App.css';
import './visualization-page.css';
import { Button } from 'src/components/button';
import { ModelAction, ViewFrame } from 'src/services/interface';
import { getById } from 'src/services/helpers';
import { ArrayView, StackInterface } from 'src/containers/stack';
import { Stack, StackTrackedItems } from 'src/abstract-data-types/stack/array';
import { Frame } from 'src/containers/frame';
import { Redirect, RouteComponentProps } from 'react-router';
import { ROUTES } from 'src/services/routes';

// TODO types! + loadable
const structuresSet = [
	{
		id: 3,
		name: 'Stack',
		model: Stack,
		view: ArrayView,
		actions: StackInterface,
		trackedItems: StackTrackedItems
	}
];

interface PageParams {
	id: string
}

// TODO DRAFT VARIANT. Should be adapted for multiple frames + there will be a side bar with frames control.
export const VisualizationPage = ({ match }: RouteComponentProps<PageParams>) => {
	const structKit = useMemo(
			() => getStructureKitById(Number(match.params.id)),
			[]
	);

	if (!structKit) {
		return <Redirect to={ROUTES.ALGS_AND_DS} />
	}

	const inputRef = useRef<HTMLInputElement>(null);
	const frame = useRef<ViewFrame<any, any>>( // types
			new Frame(structKit.model, structKit.trackedItems, structKit.view)
	);
	const FrameComponent = frame.current.component;

	return (
		<>
			<section className="section visualization-section">
				<FrameComponent />
			</section>
			<section className="section toolbar">
				<input
						ref={inputRef}
						className="toolbar__input"
						type="text"
				/>
				{
					structKit.actions.map((action: ModelAction) => (
						<Button
							key={action.name}
							className="toolbar__button"
							theme="orng"
							onClick={() => {
								actionHandler(frame.current, action, [Number(inputRef.current.value.slice(0,4))]);
								inputRef.current.value = '';
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

function getStructureKitById(id: number) {
	return typeof id === 'number' && getById(structuresSet, id);
}

function actionHandler(frame: ViewFrame<any, any>, action: ModelAction, params: any[]): void {
	const FrameAC = frame.AnimationControl;
	const FrameVMC = frame.ViewModelControl;

	FrameAC.clearHistory();
	FrameVMC.render()
		.then(() => FrameVMC.build(action, params, FrameAC.toggleHistoryStatus))
		.then(() => action.prerender && FrameVMC.render())
		.then(() => FrameAC.build(FrameVMC.view.state, FrameVMC.view.buildAnimationStep()))
		.then(() => FrameAC.start())
		.catch(err => console.log('err', err));
}
