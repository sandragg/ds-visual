import React, {
	useEffect,
	useState,
	CSSProperties
} from 'react';
import { Link } from 'react-router-dom';
import './home-page.css';
import 'src/App.css';
import { DirectionArrow } from 'src/components/direction-arrow';
import { CardList } from 'src/components/card-list';
import { PictureCard } from 'src/components/card';
import { StructureModel } from 'src/api/structure-model';
import { Structure } from 'src/services/interface';
import { ROUTES } from 'src/services/routes';
import dsv from 'src/assets/images/dsv.svg';
import boxes from 'src/assets/images/boxes.svg';

const cardListStyle: CSSProperties = {
	gridTemplateColumns: 'repeat(auto-fill, var(--card-width))'
};

type StructureList = Structure[] | null;

export const HomePage = () => {
	const [ structureList, setStructureList ] = useState<StructureList>(null);

	useEffect(() => {
		StructureModel
			.getList()
			.then(list => setStructureList(list));
	}, []);

	return (
		<>
			<section className="section homepage-section">
				<div className="title-container">
					<img className="homepage-section__title" src={dsv} alt="Title" />
					<h2 className="homepage-section__subtitle">a service for visualizing<br /> data structures and<br /> algorithms.</h2>
				</div>
				<figure className="homepage-section__boxes">
					<div className="boxes__background" />
					<img className="boxes__img" src={boxes} alt="" />
				</figure>
			</section>
			<DirectionArrow>LET’S START!</DirectionArrow>
			<section className="section structure-list-section">
				<CardList style={cardListStyle}>
					{structureList && structureList.map(struct => (
						<Link
							key={struct.id}
							to={ROUTES.VISUAL.replace(':id', `${struct.id}`)}
						>
							<PictureCard
								picPath={struct.src}
								picCaption={struct.title}
							/>
						</Link>
					))}
				</CardList>
			</section>
		</>
	);
};
