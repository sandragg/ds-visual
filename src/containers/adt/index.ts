import {
	ModelAction,
	TrackedClassItem,
	ValidationResponse
} from 'src/services/interface';
import { History } from 'src/services/history';
import { TrackedModel } from 'src/services/tracked-model';

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
	model: any,
	trackedProps: TrackedClassItem[],
	trackHandler: (trace: TrackedModel) => (res: any, args: any[], opt: TrackedClassItem, prevRes?: any) => void,
	view: any
}
