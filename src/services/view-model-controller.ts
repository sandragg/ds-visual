import {
	ADTView,
	CallbackFunction, HistoryStep,
	ModelAction,
	ValidationResponse
} from 'src/services/interface';
import { TrackedModel } from 'src/services/tracked-model';

export class ViewModelController<M, V extends ADTView<M, any>> {
	private readonly trackedModel: TrackedModel<M>;
	public readonly view: V;

	constructor(model: TrackedModel<M>, view: V) {
		this.trackedModel = model;
		this.view = view;
	}
	public validateModelOperation(handler: (model: M) => ValidationResponse): ValidationResponse {
		return handler(this.trackedModel.model);
	}
	// TODO create condition to update the view
	public build(action: ModelAction, params: any[]): Promise<void> {
		return new Promise(resolve => {
			const result: any = this.updateModel(action.method, params);
			// @ts-ignore
			if (action.mutable && result !== this.trackedModel.model.constructor.OUT_OF_DOMAIN) {
				this.updateView();
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

	private updateModel(action: string, params: any[]): any {
		this.trackedModel.history.reset();
		this.trackedModel.toggleUpdateFlag();
		const result = this.trackedModel.model[action](...params);
		this.trackedModel.toggleUpdateFlag();

		return result;
	}

	private updateView(): void {
		this.view.buildViewModel(this.trackedModel.model, this.trackedModel.history.stack);
	}
}
