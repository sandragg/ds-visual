import {
	ModelAction,
	TrackedClassItem,
	ValidationResponse
} from 'src/services/interface';
import { View } from 'src/containers/view';

export interface ADTConfig {
	id: number,
	name: string,
	interface: ModelAction[],
	abstractions: AbstractionConfig[],
	validateOperation(operation: string): (model: any) => ValidationResponse,
	deriveAndValidateParams(...params: any[]): ValidationResponse & { params?: any[] }
}

export interface AbstractionConfig {
	name: string,
	model: new () => object,
	trackedProps: TrackedClassItem[],
	view: typeof View
}
