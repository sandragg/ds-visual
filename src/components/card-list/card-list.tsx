import * as React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../services/routes';
import { PictureCard } from '../card/picture-card';
import './card-list.css';

interface Card {
	id: number,
	title: string,
	picPath: string,
	description?: string
}

interface Props {
	listType: string,
	cards: Card[]
}

const CardList = ({ listType, cards }: Props) => (
	<div className="card-list">
		{cards.map(card => (
			<Link
				key={card.id}
				to={ROUTES.VISUAL.replace(':id', `${card.id}`)}
			>
				<PictureCard
						picPath={card.picPath}
						picCaption={card.title}
				/>
			</Link>
		))}
	</div>
);

export { CardList };
