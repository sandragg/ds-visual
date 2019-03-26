import React from 'react';
import {
	ControllerHistory,
	NodeViewModel,
	TrackedItemOption,
	ViewModel
} from 'src/services/interface';
import { View } from 'src/containers/view';
import { Stack } from 'src/abstract-data-types/stack/array';
import { ArrayElementFactory } from 'src/services/node-factory';
import { FieldType } from 'src/services/constants';

export class ArrayView<VType> extends View<Stack<VType>, VType> {

	public static onTrack(history: ControllerHistory,
                        result: any,
                        args: any[],
                        opts?: TrackedItemOption): void {
		if (!history.isUpdating) {
			return;
		}

		const prevStep = history.traces.top();
		const attrs = args.length ? { up: args[0] } : null;

		if (
				!prevStep
				|| prevStep.result !== result
				|| prevStep.attrs !== attrs
		) {
			history.traces.push({ result, attrs, opts });
		}
	}

	protected Node = new ArrayElementFactory([FieldType.value]);

	public buildViewModel(model: Stack<VType>): void {
		const { stack, up } = model as any;

		this.viewModel = this.getViewInitialState();
		const { nodes } = this.viewModel;

		nodes[0] = this.buildNodeViewModel([stack[0], 0]);
		for (let i = 1; i <= up; i++) {
			nodes[i] = this.buildNodeViewModel([stack[i], i], nodes[i - 1]);
		}
		console.log(nodes);
		// coords for up pointer
	}

	public applyViewModel(): void {
		this.setState(this.viewModel);
	}

	protected build(): any {
		const { nodes } = this.state;

		return [
			this.buildNodeComponents(nodes)
		];
	}

	protected buildNodeViewModel([ value, id ]: [VType, number],
                               parentVM?: NodeViewModel<VType>): NodeViewModel<VType> {
		const coords = parentVM ? parentVM.coords : null;

		return {
			id,
			ref: React.createRef(),
			value,
			coords: !parentVM
				? { x: 0, y: 0 }
				: {
					x: coords.x + this.Node.width,
					y: coords.y
				}
		};
	}

	protected getViewInitialState(): ViewModel<VType> {
		return {
			nodes: []
		}
	}
}
