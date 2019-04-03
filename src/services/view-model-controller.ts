import {
	ADTView,
	CallbackFunction,
	ModelAction,
	VMC
} from 'src/services/interface';

export class ViewModelController<M, V extends ADTView<M, any>> implements VMC {
	private readonly model: M;
	private readonly view: V;

	constructor(model: M, view: V) {
		this.model = model;
		this.view = view;
	}
	// TODO create condition to update the view
	public build(action: ModelAction,
               params: any[],
               preUpdateCb?: CallbackFunction,
               postUpdateCb?: CallbackFunction): Promise<void> {
		return new Promise(resolve => {
			const flag: any = this.updateModel(action.method, params, preUpdateCb);
			// @ts-ignore
			if (action.mutable && flag !== this.model.constructor.OUT_OF_DOMAIN) {
				this.updateView(postUpdateCb || preUpdateCb);
			}
			resolve();
		});
	}

	public render(): Promise<void> {
		return new Promise(resolve => {
			this.view.applyViewModel(resolve);
		});
	}

	private updateModel(action: string, params: any[], cb?: CallbackFunction): any {
		typeof cb === 'function' && cb();
		return this.model[action](...params);
	}

	private updateView(cb?: CallbackFunction): void {
		typeof cb === 'function' && cb();
		this.view.buildViewModel(this.model);
	}
}
