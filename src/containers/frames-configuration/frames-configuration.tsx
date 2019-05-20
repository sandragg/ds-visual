import React, {
	FunctionComponent,
	useState,
	useCallback,
	useRef,
	SyntheticEvent,
	Dispatch,
	SetStateAction
} from 'react';
import { AbstractionConfig } from 'src/containers/adt';
import { Button } from 'src/components/button';
import './frames-configuration.css';

interface FramesConfiguration {
	abstractions: AbstractionConfig[],
	selectedViewsIndexes: Set<number>,
	onUpdate(indexes: Set<number>): void
}

const FramesConfiguration: FunctionComponent<FramesConfiguration> = (props) => {
	const { abstractions, selectedViewsIndexes, onUpdate } = props;
	const [ selected, setSelected ] = usePropsNewValue(selectedViewsIndexes);

	const onChange = useCallback(
			(e: SyntheticEvent<HTMLInputElement>) => {
				const isChecked = e.currentTarget.checked;
				if (isChecked && selected.size === 3) {
					return;
				}
				const value = Number(e.currentTarget.value);
				const newSet = new Set(selected);

				isChecked ? newSet.add(value) : newSet.delete(value);
				setSelected(newSet);
			},
			[selected]
	);

	const onReset = useCallback(
			() => setSelected(selectedViewsIndexes),
			[selectedViewsIndexes]
	);

	const onSubmit = useCallback(
			() => onUpdate(selected),
			[selected]
	);

	return (
			<>
				<ul className="configuration__list">
					{
						abstractions.map((item, index) => (
								<li key={item.name} className="list__item">
									<input
											className="checkbox"
											type="checkbox"
											name={item.name}
											value={index}
											checked={selected.has(index)}
											onChange={onChange}
									/>
									<label htmlFor={item.name}>{item.name}</label>
								</li>
						))
					}
				</ul>
				<div className="controls-container">
					<Button
							className="configuration__control-button"
							theme="orng"
							onClick={onReset}
					>
						Reset
					</Button>
					<Button
							className="configuration__control-button"
							theme="orng"
							onClick={onSubmit}
					>
						Submit
					</Button>
				</div>
			</>
	)
};

function usePropsNewValue<V = {}>(propsValue: V): [V, Dispatch<SetStateAction<V>>] {
	const prevPropsValue = useRef(propsValue);
	const [ selected, setSelected ] = useState<V>(propsValue);

	if (prevPropsValue.current !== propsValue) {
		setSelected(propsValue);
		prevPropsValue.current = propsValue;
	}

	return [ selected, setSelected ];
}

export { FramesConfiguration };
