import {
	ElementAnimationStep,
	ElementViewModel,
	HistoryStep,
} from 'src/services/interface';
import { HashMap } from 'react-move';
import { AnimationHistory } from 'src/services/animation-history';

export interface AnimationBuildOptions {
	getElementViewModelById(step: HistoryStep): ElementViewModel
	calculateByAttrs(id: number | string, attrs: HashMap, animationTrace: AnimationHistory): HashMap,
	rule?(step: HistoryStep): boolean,
	extendStep?(step: HistoryStep, vm?: ElementViewModel): ElementAnimationStep[]
}