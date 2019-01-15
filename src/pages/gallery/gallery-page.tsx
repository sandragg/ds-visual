import React, {
	useEffect,
	useState
} from 'react';
import 'src/App.css';
import { CardList } from 'src/components/card-list';
import { InfoCard } from 'src/components/card';
import { Structure } from 'src/services/interface';
import { StructureModel } from 'src/api/structure-model';

export const GalleryPage = () => {
	const [ structureList, setStructureList ] = useState<Structure[] | null>(null);

	useEffect(() => {
		StructureModel
				.getList()
				.then(list => setStructureList(list));
	}, []);

	return (
		<section className="section structure-list-section">
			<CardList>
				{structureList && structureList.map(struct => (
					<InfoCard
						key={struct.id}
						id={struct.id}
						picPath={struct.src}
						picCaption={struct.title}
					>
						{struct.description}
					</InfoCard>
				))}
			</CardList>
		</section>
	);
};
