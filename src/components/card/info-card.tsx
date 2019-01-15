import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import './info-card.css';
import { PictureCard } from './picture-card';
import { Button } from 'src/components/button';
import { ROUTES } from 'src/services/routes';

interface Props {
	id: number,
	picPath: string,
	picCaption: string,
	children: string
}

const pictureCardStyle: CSSProperties = {
	margin: 0
};

const InfoCard = ({ id, picPath, picCaption, children }: Props) => {
	return (
		<article className="struct-card">
			<PictureCard
				className="struct-card__pic"
				style={pictureCardStyle}
				pictureOnly
				picPath={picPath}
			/>
			<h1 className="struct-card__title">{picCaption}</h1>
			<p className="struct-card__description">{children}</p>
			<div className="buttons-container">
				<Link to={ROUTES.INFO.replace(':id', `${id}`)}>
					<Button theme="orng">read more</Button>
				</Link>
				<Link to={ROUTES.VISUAL.replace(':id', `${id}`)}>
					<Button theme="orng">explore</Button>
				</Link>
			</div>
		</article>
	);
};

export { InfoCard };
