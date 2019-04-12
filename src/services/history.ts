import { HistoryStep } from 'src/services/interface';

/**
 * History is a stack trace of the actions was performed during ADT operation.
 * The history is built through a custom handler provided by the data structure view.
 */
export class History {
	/**
	 * Each step describes one action using element id, its mutation object
	 * and action type optional parameter.
	 */
	public stack: HistoryStep[] = [];

	public push(step: HistoryStep): void {
		this.stack.push(step);
	}

	public top(): HistoryStep {
		return this.stack[this.stack.length - 1];
	}

	public reset(): void {
		this.stack = [];
	}
}
