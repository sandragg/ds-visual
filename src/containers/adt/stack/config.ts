import {
	ModelAction,
	ValidationResponse
} from 'src/services/interface';
import { StackInterface } from './interface';
import { ADTConfig } from 'src/containers/adt/index';
import { Array } from 'src/abstract-data-types/stack';
import { ArrayView } from './array';
import { AbstractView } from './abstract';

const config: ADTConfig = {
	id: 3,
	name: 'stack',
	interface: StackInterface,
	validateOperation,
	deriveAndValidateParams,
	abstractions: [
		{
			name: 'general',
			model: Array.Stack,
			trackedProps: Array.trackedProps,
			trackHandler: Array.onTrack,
			view: AbstractView
		},
		{
			name: 'array',
			model: Array.Stack,
			trackedProps: Array.trackedProps,
			trackHandler: Array.onTrack,
			view: ArrayView
		}
	]
};

// TODO revise
function validateOperation(operation: string): (model: any) => ValidationResponse {
	return (model: any) => {
		let errorText;

		switch (operation) {
			case 'push':
				if (model.full()) {
					errorText = 'Stack overflowed'
				}
				break;
			case 'pop':
			case 'top':
				if (model.empty()) {
					errorText = 'Stack is empty'
				}
				break;
		}

		return errorText
				? { isValid: false, errorText }
				: { isValid: true };
	}
}

// TODO revise
function deriveAndValidateParams(operation: ModelAction, inputs: string[]) {
	if (operation.method !== 'push') {
		return { isValid: true };
	}

	return inputs[0] && !isNaN(Number(inputs[0]))
			? { isValid: true, params: [Number(inputs[0].slice(0,4))] }
			: { isValid: false, errorText: 'Type of value should be a number' }
}

export default config;
