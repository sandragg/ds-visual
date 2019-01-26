import React, {
	useMemo,
	useRef
} from 'react';
import 'src/App.css';
import './visualization-page.css';
import { Button } from 'src/components/button';
import { Canvas } from 'src/components/canvas';
import { BSTView, BstInterface } from 'src/containers/bst';
import { ModelAction } from 'src/services/interface';
import { getById } from 'src/services/helpers';

// TODO types!
const structuresSet = [
	{
		id: 1,
		name: 'BST',
		component: BSTView,
		actions: BstInterface
	}
];

export const VisualizationPage = ({ match }: any) => {
	const structRef = useRef(null);
	const structKit = useMemo(
			() => getStructureKitById(Number(match.params.id)),
			[]
	);

	return structKit && (
		<>
			<section className="section visualization-section">
				<Canvas>
					<structKit.component ref={structRef} />
				</Canvas>
			</section>
			<section className="section toolbar">
				{structKit.actions.map((action: ModelAction) => (
					<Button
						key={action.name}
						theme="orng"
						onClick={() => structRef.current && structRef.current[action.method](Math.random() * 100 | 0)}
					>
						{action.name}
					</Button>
				))}
			</section>
		</>
	);
};

function getStructureKitById(id: number) {
	const result = id && getById(structuresSet, id);

	return result || null;
}
