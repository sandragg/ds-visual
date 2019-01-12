import React, {
	useEffect,
	useState
} from 'react';
import './home-page.css';
import { DirectionArrow } from 'src/components/direction-arrow';
import { CardList } from 'src/components/card-list';
import { StructureModel } from 'src/api/structure-model';
import dsv from 'src/assets/images/dsv.svg';
import boxes from 'src/assets/images/boxes.svg';
import { Structure } from 'src/services/interface';

export const HomePage = () => {
	const [ structureList, setStructureList ] = useState<Structure[] | null>(null);

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
				<CardList listType="presentation" cards={structureList} />
			</section>
		</>
	);
};
