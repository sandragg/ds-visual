import { AbstractionConfig } from 'src/containers/adt';
import { History } from 'src/services/history';
import { bindTracker } from 'src/services/tracker';

export class TrackedModel<M = {}> {
	/**
	 * In order to remain actions performed inside model it is wrapped in tracker.
	 */
	public model: M;
	/**
	 * There is no way to temporarily turn tracking off. So, it also possible to change history through a trackHandler
	 * beyond the model update, for example, during view model build where also getting access to the model properties.
	 *
	 * Aim of flag to prevent these history changes. Flag is toggled before and after model update.
	 * As trackHandler accepts trace parameter it's possible to check flag inside and terminate history change.
	 */
	public isUpdating: boolean;
	/**
	 * History is built during model update: every access to a model tracked property calls trackHandler
	 * which will push new step into history - that is what tracker wrapper provides.
	 */
	public history: History;

	constructor(config: AbstractionConfig) {
		this.history = new History();
		this.isUpdating = false;
		this.model = bindTracker<M>(
			new config.model(),
			config.trackedProps,
			config.trackHandler(this)
		);
	}

	public toggleUpdateFlag(flag?: boolean) {
		this.isUpdating = flag == null ? !this.isUpdating : flag;
	}
}