import {
	ADTView,
	CallbackFunction, HistoryStep,
	ModelAction,
	ValidationResponse
} from 'src/services/interface';

export class ViewModelController<M, V extends ADTView<M, any>> {
	private readonly model: M;
	public readonly view: V;

	constructor(model: M, view: V) {
		this.model = model;
		this.view = view;
	}
	public validateModelOperation(handler: (model: M) => ValidationResponse): ValidationResponse {
		return handler(this.model);
	}
	// TODO create condition to update the view
	public build(action: ModelAction,
               params: any[],
               history?: HistoryStep[],
               preUpdateCb?: CallbackFunction,
               postUpdateCb?: CallbackFunction): Promise<void> {
		return new Promise(resolve => {
			const result: any = this.updateModel(action.method, params, preUpdateCb);
			// @ts-ignore
			if (action.mutable && result !== this.model.constructor.OUT_OF_DOMAIN) {
				this.updateView(postUpdateCb || preUpdateCb, history);
			}
			resolve(result);
		});
	}

	public render(): Promise<void> {
		return new Promise(resolve => {
			this.view.applyViewModel(resolve);
		});
	}

	public prerender(): Promise<void> {
		return new Promise(resolve => {
			this.view.prerender(resolve);
		});
	}

	private updateModel(action: string, params: any[], cb?: CallbackFunction): any {

		typeof cb === 'function' && cb();
		return this.model[action](...params);
	}

	private updateView(cb?: CallbackFunction, history?: HistoryStep[]): void {
		typeof cb === 'function' && cb();
		this.view.buildViewModel(this.model, history);
	}
}
