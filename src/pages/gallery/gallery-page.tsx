import React, {
	useEffect,
	useState
} from 'react';
import 'src/App.css';
import { CardList } from 'src/components/card-list';
import { InfoCard } from 'src/components/card';
import { Structure } from 'src/services/interface';
import { StructureModel } from 'src/api/structure-model';
import { NavLink } from 'react-router-dom';
import { ROUTES } from 'src/services/routes';
import './gallery-page.css';

export const GalleryPage = () => {
	const [ structureList, setStructureList ] = useState<Structure[] | null>(null);

	useEffect(() => {
		StructureModel
				.getList(false)
				.then(list => setStructureList(list));
	}, []);

	return (
		<section className="section structure-list-section">
			<div className="button-container">
				<NavLink
						to={ROUTES.GUIDE}
						className="guide-link-button"
				>
					How to use it?
				</NavLink>
			</div>
			<CardList>
				{structureList && structureList.map(struct => (
					<InfoCard
						key={struct.id}
						id={struct.id}
						picPath={struct.src}
						picCaption={struct.title}
					>
						{struct.description[0]}
					</InfoCard>
				))}
			</CardList>
		</section>
	);
};
