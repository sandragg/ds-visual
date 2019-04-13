import {
	Trace,
	AnimationHistoryStep,
	ElementAnimationStep,
	HistoryStep,
	PromiseDefer,
	ViewModel
} from 'src/services/interface';
import { defer } from 'src/services/helpers';
import { nodeAnimationStates } from 'src/services/animation-style';
import { PromiseStatus } from 'src/services/constants';
import { AnimationHistory } from 'src/services/animation-history';
import { History } from 'src/services/history';

/**
 *
 */
export class AnimationController {

	public trace: Trace = {
		history: new History(),
		isUpdating: false
	};
	public animationTrace = new AnimationHistory();
	private activeAnimation: PromiseDefer = null;
	public activeStep: number = 0;

	constructor() {
		this.toggleHistoryStatus = this.toggleHistoryStatus.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.rewind = this.rewind.bind(this);
	}

	public toggleHistoryStatus(): void {
		this.trace.isUpdating = !this.trace.isUpdating;
	}
	// TODO REFACTOR!
	public build(vm: ViewModel<any>,
               handler: (vm: ViewModel<any>, step: HistoryStep, hist?: AnimationHistoryStep[]) => AnimationHistoryStep[]): void {
		this.animationTrace.history = this.trace.history.stack.reduce(
			(res, step) => {
				const steps = handler(vm, step, res);
				res.push(...steps);
				return res;
			},
			[]
		);
		console.log('animationHistory', this.animationTrace.history);
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
