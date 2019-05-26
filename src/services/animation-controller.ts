import {
	AnimationHistoryStep,
	ElementAnimationStep,
	PromiseDefer,
} from 'src/services/interface';
import { buildAnimationStep, defer } from 'src/utils/animation';
import animationStyles from 'src/services/animation-style';
import { PromiseStatus, TrackedActions } from 'src/services/constants';
import { AnimationHistory } from 'src/services/animation-history';
import { AnimationBuildOptions } from 'src/utils/utils.interface';
import { TrackedModel } from 'src/services/tracked-model';

/**
 * Controller to manage animation.
 * Stores operation actions history and animation history built on it.
 * Provides methods to play/pause/rewind animation steps.
 */
export class AnimationController {
	public trace: TrackedModel;
	/**
	 * Animation history.
	 */
	public animationTrace = new AnimationHistory();
	/**
	 * Active (current) step in animation history. From this step animation will play.
	 * Value range [-1, animationTrace.length - 1].
	 */
	public activeStep: number = 0;
	/**
	 * Active animation promise.
	 * Defer is used in order to to solve the promise outside the play method where it's created, e.g. in pause.
	 */
	private activeAnimation: PromiseDefer = null;

	constructor(model: TrackedModel) {
		this.trace = model;
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.rewind = this.rewind.bind(this);
		this.reset = this.reset.bind(this);
	}
	/**
	 * Build animation history.
	 * @param options Options include handlers for animation build specific to each view
	 */
	public build(options: AnimationBuildOptions): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log('History', this.trace.history);
			const buildHandler = buildAnimationStep(options);
			this.animationTrace.reset();

			this.animationTrace.history = this.trace.history.stack.reduce(
					(res, step) => {
						res.push(...buildHandler(step, this.animationTrace));
						return res;
					},
					this.animationTrace.history
			);
			console.log('animationHistory', this.animationTrace.history);
			resolve();
		})
	}
	/**
	 * Reset animation:
	 * 1. Reject active promise
	 * 2. Set active step in -1
	 * 3. Set history update flag in false
	 * 4. Reset histories
	 */
	public reset(): void {
		console.log('reset');
		if (this.activeAnimation) {
			this.activeAnimation.reject('animation is reseted');
			this.activeAnimation = null;
		}
		this.animationTrace.reset();
		this.activeStep = -1;
	}
	/**
	 * Apply animation step.
	 * @param step
	 */
	public apply(step: AnimationHistoryStep): Promise<any> {
		return Promise.all(
			Array.isArray(step)
				? step.map(this.startAnimation)
				: [ this.startAnimation(step) ]
		);
	}
	/**
	 * Reject active animation promise.
	 */
	public pause(): void {
		if (this.activeAnimation) {
			this.activeAnimation.reject('animation is paused');
		}
	}
	/**
	 * Play animation starting at the active step.
	 *
	 * NOTE:
	 * 1. Reject or resolve don't terminate promise executor. Thus, we need to track deferred promise status
	 * in executor independently and exit via return.
	 * 2. Deferred promise is used from scope to avoid collision with a new one stored in the AC instance.
	 */
	public play(): Promise<any> {
		console.log('play');
		const deferred = defer(async (resolve) => {
			const { history } = this.animationTrace;
			let step = this.activeStep < 0 ? 0 : this.activeStep;

			while (
				(!deferred || deferred.promise.status !== PromiseStatus.rejected)
				&& step < history.length
			) {
				this.activeStep = step;
				await this.apply(history[step]);
				step++;
			}
			resolve('animation is ended');
		});
		this.activeAnimation = deferred;

		return this.activeAnimation.promise;
	}
	/**
	 * Rewind animation to accepted step:
	 * 1. Active animation terminates
	 * 2. Active step is assigned to `stepTo`
	 * 3. All elements go into state preceding the new active step
	 *
	 * NOTE:
	 * 1. Active step isn't applied in rewind. It will be animated in play method.
	 * 2. According to the current implementation, there is no information about whether step was animated or not.
	 * Thus, even if the steps are equal each rewind call will recalculate and apply preceding state to elements.
	 * For the same reason, there is a problem with rewinding to the current step.
	 * The minimum reverse step should be activeStep - 1.
	 * @param stepTo
	 */
	public rewind(stepTo: number): Promise<any> {
		console.log('rewind');
		if (!this.animationTrace.history.length) {
			return Promise.resolve();
		}

		const { length } = this.animationTrace.history;
		const stepFrom = this.activeStep;

		stepTo = stepTo > length
				? length
				: stepTo < 0 ? 0 : stepTo;
		this.activeStep = stepTo === length ? length - 1 : stepTo;
		this.pause();

		return this.apply(this.calculateRewindStep(stepFrom, stepTo));
	}
	/**
	 * Calculate animation step that includes elements and their states preceding the new active step.
	 * Animation history traverse range:
	 * 1. Forward rewind. [stepFrom, stepTo) or [stepFrom, stepTo - 1], stepFrom < stepTo
	 * 2. Back rewind. [stepTo, stepFrom], stepFrom >= stepTo
	 * @param stepFrom
	 * @param stepTo
	 */
	private calculateRewindStep(stepFrom: number, stepTo: number): AnimationHistoryStep {
		const rewindStep: { [key: number]: ElementAnimationStep } = {};
		const isReverse = stepFrom >= stepTo;
		const iterator = this.animationTrace[Symbol.iterator](
			stepFrom,
			(stepFrom <= stepTo && stepTo) ? stepTo - 1 : stepTo
		);

		for (let nextElement = iterator.next(), id, element; !nextElement.done; nextElement = iterator.next()) {
			element = nextElement.value;
			if (isReverse) {
				element = this.animationTrace.elementIterator(element).next().value || element;
			}
			id = element.ref.current.id;
			rewindStep[id] = this.mergeElementAnimationSteps(rewindStep[id], element, isReverse);
		}

		return Object.values(rewindStep);
	}
	/**
	 * Merge element next state to the previous.
	 * @param prevStep
	 * @param nextStep
	 * @param isReverse
	 */
	private mergeElementAnimationSteps(prevStep: ElementAnimationStep,
                                     nextStep: ElementAnimationStep,
                                     isReverse: boolean): ElementAnimationStep {
		if (prevStep) {
			Object.assign(prevStep.attrs, nextStep.attrs);
		}
		else {
			prevStep = {
				...nextStep,
				attrs: { ...nextStep.attrs }
			};
		}
		prevStep.action = isReverse ? getReverseAction(nextStep.action) : nextStep.action;

		return prevStep;
	}
	/**
	 * Apply new attributes to the element.
	 * @param ref
	 * @param attrs
	 * @param action
	 */
	private startAnimation({ ref, attrs, action }: ElementAnimationStep): Promise<any> {
		return ref.current.animate([ attrs, animationStyles[action] ]);
	}
}

function getReverseAction(action: TrackedActions): TrackedActions {
	switch (action) {
		case TrackedActions.new:
			return TrackedActions.delete;
		default:
			return TrackedActions.default;
	}
}
