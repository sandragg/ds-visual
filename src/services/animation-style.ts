import { TrackedActions } from './constants';

export const arrowAnimationStates = {
	[TrackedActions.default]: {
		fill: ['black'],
		stroke: ['black'],
		opacity: 1
	},
	[TrackedActions.select]: [
		{
			fill: ['#b9deff'],
			stroke: ['#b9deff'],
			timing: { duration: 500 }
		}
	],
	[TrackedActions.new]: [
		{
			fill: ['#b9ffda'],
			stroke: ['#b9ffda'],
			opacity: [0, 1],
			timing: { duration: 200 }
		}
	],
};

export const nodeAnimationStates = {
	[TrackedActions.default]: [
		{
			fill: 'peachpuff',
			opacity: 1
		}
	],
	[TrackedActions.select]: [
		{
			fill: ['#b9deff'],
			timing: { duration: 1000 }
		}
	],
	[TrackedActions.new]: [
		{
			fill: ['#b9ffda'],
			opacity: [0, 1],
			scale: [0, 1],
			timing: { duration: 200 }
		}
	],
	[TrackedActions.change]: [
		{
			fill: ['#ffbe65'],
			timing: { duration: 1000 }
		}
	],
};
