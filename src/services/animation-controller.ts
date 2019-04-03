import {
	AC,
	ControllerHistory,
	ViewModel
} from 'src/services/interface';
import { Tracer } from 'src/services/tracer';
import { animateQueue } from 'src/services/helpers';

export class AnimationController implements AC {

	private _history: ControllerHistory = {
		traces: new Tracer(),
		isUpdating: false
	};

	get history(): ControllerHistory {
		return this._history;
	}

	constructor() {
		this.toggleHistoryStatus = this.toggleHistoryStatus.bind(this);
	}

	public toggleHistoryStatus(): void {
		this._history.isUpdating = !this._history.isUpdating;
	}

	public build(vm: ViewModel<any>, handler: Function): void {
		this._history.traces.buildAnimationHistory(vm, handler);
		console.log(this._history.traces);
	}

	public start(): Promise<void> {
		return animateQueue(this._history.traces.animationHistory).promise;
	}

	public clearHistory(): void {
		this._history.isUpdating = false;
		this._history.traces.reset();
	}
}
