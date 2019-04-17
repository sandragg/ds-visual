import { TrackedActions } from './constants';

const animationStyles = {
	[TrackedActions.default]: {
		fill: '#c6d3fe',
		opacity: 1,
		scale: 1
	},
	[TrackedActions.select]: {
		fill: ['#dab9ff'],
		opacity: 1,
		scale: 1,
		timing: { duration: 200 }
	},
	[TrackedActions.change]: {
		fill: ['#ffdab9'],
		opacity: 1,
		scale: 1,
		timing: { duration: 200 }
	},
	[TrackedActions.new]: {
		fill: '#b9ffda',
		opacity: [1],
		scale: [1],
		timing: { duration: 200 }
	},
	[TrackedActions.delete]: {
		fill: '#fecfd9',
		opacity: [0],
		scale: [0],
		timing: { duration: 200 }
	}
};

export default animationStyles;
