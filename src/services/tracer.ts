import {
	ViewModel,
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

	public buildAnimationHistory(vm: ViewModel<any>,
                               cb: (vm: ViewModel<any>, step: HistoryStep, hist?: AnimationHistoryStep[]) => AnimationHistoryStep[]): void {
		console.log('buildAnimationHistory', vm, this.history);

		this.animationHistory = this.history.reduce(
			(res, step) => {
				const steps = cb(vm, step, res);
				res.push(...steps);
				return res;
			},
			[]
		);
		console.log('animationHistory', this.animationHistory);
	}
}
