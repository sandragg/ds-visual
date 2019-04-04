import React, {
	useMemo,
	useRef,
	useCallback,
	ComponentType
} from 'react';
import { Button } from 'src/components/button';
import {
	ModelAction,
	TrackedClassItem,
	ViewFrame
} from 'src/services/interface';
import { getById } from 'src/services/helpers';
import { ArrayView, StackInterface } from 'src/containers/stack';
import { Stack, StackTrackedItems } from 'src/abstract-data-types/stack/array';
import { Frame } from 'src/containers/frame';
import { Redirect, RouteComponentProps } from 'react-router';
import { ROUTES } from 'src/services/routes';
import 'src/App.css';
import './visualization-page.css';

interface Structure {
	id: number,
	name: string,
	model: new () => object,
	view: ComponentType,
	actions: ModelAction[],
	trackedItems: TrackedClassItem[],
	deriveAndValidate(...params: any[]): { params?: any[], isValid: boolean, errorText?: string }
}

// TODO loadable
const structuresSet: Structure[] = [
	{
		id: 3,
		name: 'Stack',
		model: Stack,
		view: ArrayView,
		actions: StackInterface,
		trackedItems: StackTrackedItems,
		deriveAndValidate: (action: ModelAction, inputs: number) => {
			if (action.method !== 'push') {
				return { isValid: true };
			}

			return inputs[0] && !isNaN(Number(inputs[0]))
				? { isValid: true, params: [Number(inputs[0].slice(0,4))] }
				: { isValid: false, errorText: 'Type of value should be a number' }
		}
	}
];

interface PageParams {
	id: string
}

// TODO DRAFT VARIANT. Should be adapted for multiple frames + there will be a side bar with frames control.
export const VisualizationPage = ({ match }: RouteComponentProps<PageParams>) => {
	const structKit: Structure = useMemo(
			() => getStructureKitById(Number(match.params.id)),
			[]
	);

	if (!structKit) {
		return <Redirect to={ROUTES.ALGS_AND_DS} />
	}

	const inputRef = useRef<HTMLInputElement>(null);
	const outputRef = useRef<HTMLOutputElement>(null);
	const frame = useRef<ViewFrame<any, any>>( // types
		new Frame(structKit.model, structKit.trackedItems, structKit.view)
	);
	const FrameComponent = frame.current.component;

	const handleResult = useCallback(
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
				<FrameComponent />
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
				{
					structKit.actions.map((action: ModelAction) => (
						<Button
							key={action.name}
							className="toolbar__button"
							theme="orng"
							onClick={() => {
								const {
									params,
									isValid,
									errorText
								} = structKit.deriveAndValidate(action, [inputRef.current.value]);

								if (!isValid) {
									outputRef.current.hidden = false;
									outputRef.current.value = errorText;
									return;
								}
								outputRef.current.hidden = true;
								inputRef.current.value = '';
								actionHandler(frame.current, action, params, handleResult);
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

function actionHandler(frame: ViewFrame<any, any>,
                       action: ModelAction,
                       params: any[],
                       actionResultHandler: Function): void {
	const FrameAC = frame.AnimationControl;
	const FrameVMC = frame.ViewModelControl;

	FrameAC.clearHistory();
	FrameVMC.render()
		.then(() => FrameVMC.build(action, params, FrameAC.toggleHistoryStatus))
		.then(res => {
			actionResultHandler(res);
			return action.prerender && FrameVMC.render();
		})
		.then(() => FrameAC.build(FrameVMC.view.state, FrameVMC.view.buildAnimationStep()))
		.then(() => FrameAC.start())
		.catch(err => console.log('err', err));
}
