import { TRACKED_ACTIONS } from './constants';

export const arrowAnimationStates = {
	[TRACKED_ACTIONS.DEFAULT]: {
		fill: ['black'],
		stroke: ['black'],
		scale: [1],
		opacity: [1]
	},
	[TRACKED_ACTIONS.SELECT]: [
		{
			fill: ['#b9deff'],
			stroke: ['#b9deff'],
			timing: { duration: 200 }
		}
	],
	[TRACKED_ACTIONS.INSERT]: [
		{
			fill: ['#b9ffda'],
			stroke: ['#b9ffda'],
			opacity: [0, 1],
			timing: { duration: 200 }
		}
	],
};

export const nodeAnimationStates = {
	[TRACKED_ACTIONS.DEFAULT]: {
		fill: ['peachpuff'],
		scale: [1],
		opacity: [1]
	},
	[TRACKED_ACTIONS.SELECT]: [
		{
			fill: ['#b9deff'],
			timing: { duration: 450 }
		}
	],
	[TRACKED_ACTIONS.INSERT]: [
		{
			fill: ['#b9ffda'],
			opacity: [0, 1],
			scale: [0, 1],
			timing: { duration: 200 }
		}
	]
};
