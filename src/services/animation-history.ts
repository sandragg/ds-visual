import {
	AnimationHistoryStep,
	ElementAnimationStep
} from 'src/services/interface';

/**
 * Animation history is a stack trace of the animation.
 * Each operation call builds own history represents performed actions.
 * The animation history is built based on the this history through a custom handler provided by the data structure view.
 */
export class AnimationHistory {
	/**
	 * One animation step may include changes from one or several elements,
	 * e.g. deleting a node will destroy both the node and all linked arrows in one step.
	 */
	public history: AnimationHistoryStep[] = null;
	/**
	 * Reset the animation history.
	 */
	public reset(): void {
		this.history = [];
	}
	/**
	 * Default iterator.
	 * Traverse the history step by step element by element from `begin` position to the `end`.
	 * Traversal direction is defined by received positions relations.
	 * TODO Revise. Probably it would be safety and more informative to pass optional direction parameter instead of internal compute.
	 * @param begin
	 * @param end
	 */
	public *[Symbol.iterator](begin?: number, end?: number): Iterator<ElementAnimationStep> {
		begin = this.validatePosition(begin) ? begin : 0;
		end = this.validatePosition(end) ? end : this.history.length;

		const isReverse = begin > end;
		let historyStep: AnimationHistoryStep;
		let elementStep: ElementAnimationStep;
		let elementIndex = 0;

		while (this.isEnd(begin, end, isReverse)) {
			historyStep = this.history[begin];
			elementStep = Array.isArray(historyStep)
					? historyStep[elementIndex]
					: historyStep;

			yield elementStep;

			if (Array.isArray(historyStep)) {
				if (++elementIndex === historyStep.length) {
					elementIndex = 0;
				}
				else {
					continue;
				}
			}
			isReverse ? begin-- : begin++;
		}
	}
	/**
	 * Element iterator.
	 * Traverse the history of the element changes from the current position to the begin, first mention.
	 * Traversal is one-way and reverse relative to the animation history.
	 * @param element
	 */
	public *elementIterator(element: ElementAnimationStep): Iterator<ElementAnimationStep> {
		const id = element.ref.current.id;
		let prevStepIndex = element.previousState;
		let elementPrevStep: AnimationHistoryStep;

		while (prevStepIndex !== null) {
			elementPrevStep = this.history[prevStepIndex];
			if (Array.isArray(elementPrevStep)) {
				elementPrevStep = elementPrevStep.find(elem => elem.ref.current.id === id);
			}

			yield elementPrevStep;

			prevStepIndex = elementPrevStep.previousState;
		}

		return null;
	}
	/**
	 * Check if the end has been reached.
	 * @param begin
	 * @param end
	 * @param isReverse
	 */
	private isEnd(begin: number, end: number, isReverse: boolean): boolean {
		return isReverse ? begin >= end : begin <= end;
	}
	/**
	 * Check if the position is in range.
	 * @param position
	 */
	private validatePosition(position: number): boolean {
		return position >= 0 && position < this.history.length;
	}
}
