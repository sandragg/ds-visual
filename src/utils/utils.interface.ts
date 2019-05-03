import {
	ArrowViewModel,
	ElementAnimationStep,
	ElementViewModel,
	HistoryStep,
	NodeViewModel
} from 'src/services/interface';
import { HashMap } from 'react-move';

export interface AnimationBuildOptions {
	getElementViewModelById(step: HistoryStep): ElementViewModel
	calculateByAttrs(id: number | string, attrs: HashMap): HashMap,
	rule?(step: HistoryStep): boolean,
	extendStep?(step: HistoryStep): ElementAnimationStep[]
}