import React, {
	useState,
	useCallback,
	HTMLAttributes
} from 'react';
import { IconButton } from 'src/components/button';
import {
	BackIcon,
	ForwardIcon,
	PauseIcon,
	PlayIcon,
	RestartIcon
} from 'src/components/icons';
import './animation-control.css';

interface AnimationControlProps {
	stepsAmount?: number,
	onPlay?(): void,
	onPause?(): void,
	onBack?(): void,
	onForward?(): void,
	onRewind?(step: number): void
}

type Props = AnimationControlProps & HTMLAttributes<HTMLElement>;

const AnimationControl = (props: Props) => {
	const {
		stepsAmount,
		onBack,
		onForward,
		onPlay,
		onPause,
		onRewind
	} = props;

	const [ isPaused, setIsPaused ] = useState<boolean>(true);

	const onRestart = useCallback(
		() => {
			onRewind(0);
			setIsPaused(true);
		},
		[onRewind]
	);
	const togglePlayback = useCallback(
		() => {
			isPaused ? onPlay() : onPause();
			setIsPaused(!isPaused);
		},
		[
			onPlay,
			onPause,
			isPaused
		]
	);

	return (
		<div className="animation-control">
			{stepsAmount}
			{
				onBack && (
					<IconButton onClick={() => { setIsPaused(true); onBack(); }}>
						<BackIcon />
					</IconButton>
				)
			}
			{
				isPaused ? (
					<IconButton onClick={togglePlayback}>
						<PlayIcon />
					</IconButton>
				) : (
					<IconButton onClick={togglePlayback}>
						<PauseIcon />
					</IconButton>
				)
			}
			{
				onForward && (
					<IconButton onClick={() => { setIsPaused(true); onForward(); }}>
						<ForwardIcon />
					</IconButton>
				)
			}
			{
				onRewind && (
					<IconButton
						className="restart-button"
						onClick={onRestart}
					>
						<RestartIcon />
					</IconButton>
				)
			}
		</div>
	)
};

export { AnimationControl, AnimationControlProps };
