import {
	ViewModel,
	CallbackFunction,
	History,
	HistoryStep,
	AnimationHistoryStep
} from 'src/services/interface';

export class Tracer implements History {
	public history: HistoryStep[] = [];
	public animationHistory: AnimationHistoryStep[] = null;

	public push(step: HistoryStep): void {
		this.history.push(step);
	}

	public top(): HistoryStep {
		return this.history[this.history.length - 1];
	}

	public reset(): void {
		this.history = [];
		this.animationHistory = null;
	}

	public buildAnimationHistory(vm: ViewModel<any>, cb: CallbackFunction): void {

	}
}
