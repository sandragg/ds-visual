import {
	ModelAction,
	Trace,
	TrackedClassItem,
	ValidationResponse
} from 'src/services/interface';

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
	trackHandler: (trace: Trace) => (res: any, args: any[], opt: TrackedClassItem, prevRes?: any) => void,
	view: any
}
