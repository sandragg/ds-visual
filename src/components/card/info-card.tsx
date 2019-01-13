import * as React from 'react';
import './info-card.css';
import { PictureCard } from './picture-card';
import { Button } from '../button';

interface Props {
	picPath: string,
	picCaption: string,
	children: string
}

const InfoCard = ({ picPath, picCaption, children }: Props) => {
	return (
		<article className="struct-card">
			<PictureCard
				className="struct-card__pic"
				pictureOnly
				picPath={picPath}
			/>
			<div className="struct-card__content-container">
				<div className="struct-card__description">
					<h1 className="description-title">{picCaption}</h1>
					<p className="description-text">{children}</p>
				</div>
				<Button theme="orng" shape="rect">read more</Button>
				<Button theme="orng" shape="rect">explore</Button>
			</div>
		</article>
	);
};

export { InfoCard };
