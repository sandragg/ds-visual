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
 * Controller to manage animation.
 * Stores operation actions history and animation history built on it.
 * Provides methods to play/pause/rewind animation steps.
 */
export class AnimationController {
	/**
	 * Trace consists of actions history and flag which shows if the history is updating at the moment.
	 *
	 * In order to remain actions performed inside model it is wrapped in tracker (in Frame component).
	 * History is built during model update: every access to a model tracked property calls trackHandler
	 * which will push new step into history - that is what tracker wrapper provides and there is no way
	 * to temporarily turn it off. So, it also possible to change history through a trackHandler beyond
	 * the model update, for example, during view model build where also getting access to the model properties.
	 *
	 * Aim of flag to prevent these history changes. Flag is toggled before and after view model build.
	 * As trackHandler accepts trace parameter it's possible to check flag inside and terminate history change.
	 */
	public trace: Trace = {
		history: new History(),
		isUpdating: false
	};
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

	constructor() {
		this.toggleHistoryStatus = this.toggleHistoryStatus.bind(this);
		this.play = this.play.bind(this);
		this.pause = this.pause.bind(this);
		this.rewind = this.rewind.bind(this);
	}
	/**
	 * Callback to toggle trace flag that shows history update status.
	 */
	public toggleHistoryStatus(): void {
		this.trace.isUpdating = !this.trace.isUpdating;
	}
	/**
	 * Build animation history.
	 * TODO REFACTOR!
	 * @param vm
	 * @param handler
	 */
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
		this.trace.isUpdating = false;
		this.trace.history.reset();
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
			rewindStep[id] = this.mergeElementAnimationSteps(rewindStep[id], element);
		}

		return Object.keys(rewindStep).map(key => rewindStep[key]);
	}
	/**
	 * Merge element next state to the previous.
	 * @param prevStep
	 * @param nextStep
	 */
	private mergeElementAnimationSteps(prevStep: ElementAnimationStep,
                                     nextStep: ElementAnimationStep): ElementAnimationStep {
		if (prevStep) {
			prevStep.action = nextStep.action; // TODO should be condition for a step action: new<=>delete default<=>select,change
			Object.assign(prevStep.attrs, nextStep.attrs);
		}
		else {
			prevStep = Object.assign({}, nextStep);
		}

		return prevStep;
	}
	/**
	 * Apply new attributes to the element.
	 * @param ref
	 * @param attrs
	 * @param action
	 */
	private startAnimation({ ref, attrs, action }: ElementAnimationStep): Promise<any> {
		return ref.current.animate([ attrs, ...nodeAnimationStates[action] ]); // TODO styles for arrows and nodes
	}
}
