import React, {
	useEffect,
	useState
} from 'react';
import { Link } from 'react-router-dom';
import { StructureModel } from 'src/api/structure-model';
import { Structure } from 'src/services/interface';
import { ROUTES } from 'src/services/routes';
import './info-page.css';
import arrow from 'src/assets/images/arrow.svg';

export const InfoPage = ({ match }) => {
    const [ structure, setStructure ] = useState<Structure | null>(null);

	useEffect(() => {
		StructureModel
                .getOne(Number(match && match.params.id), true)
                .then(struct => setStructure(struct));
    }, []);

    return (
    <section className="section info-section">
    	<article className="info-section__card">
            <div className="info__title__container">
                <Link to={ROUTES.ALGS_AND_DS}>
                    <img src={arrow} alt="arrow" />
                </Link>
                <h1 className="info__title">{structure && structure.title}</h1>
                {/* <p></p>
                <p></p>
                <p></p> */}
            </div>
        </article>
    </section>
    );
};