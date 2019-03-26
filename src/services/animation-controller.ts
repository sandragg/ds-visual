import {
	AC,
	History,
	ControllerHistory
} from 'src/services/interface';
import { Tracer } from 'src/services/tracer';

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

	public build(handler: (traces: History) => void): void {
	}

	public start(): void {
	}
}
