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
import { PictureCard } from '../../components/card';

export const InfoPage = ({ match }) => {
    const [ structure, setStructure ] = useState<Structure | null>(null);

	useEffect(() => {
		StructureModel
                .getOne(Number(match && match.params.id), true)
                .then(struct => setStructure(struct));
    }, []);

    return (
    <section className="section info-section">
    {structure &&
        <article className="info-section__card">
            <div className="flex__container">
                <Link to={ROUTES.ALGS_AND_DS}>
                    <img src={arrow} alt="arrow" />
                </Link>
                <h1 className="info__title">{structure.title}</h1>
             </div>
                <div className="flex__container">
                    <div className="paragraphs__container">
                        <p>{structure.description[0]}</p>
                        <p>{structure.description[1]}</p>
                    </div>
                    <img src={structure.src} />
                </div>
                {structure.operations_names &&
                <p>
                    <ul>
                        <li>
                            <b>{structure.operations_names[0]}</b>
                            {structure.description[2]}
                        </li>
                        <li>
                            <b>{structure.operations_names[1]}</b>
                            {structure.description[3]}
                        </li>
                    </ul>
                </p>
                }
                <p>{structure.description[4]}</p>
                <div className="pictures flex__container">
                    {structure.operations_srcs && structure.operations_srcs.map(operationSrc => (
                        <PictureCard
                            pictureOnly
                            picPath={operationSrc}
                        />
                    ))}
                </div>
        </article>
    }
    </section>
    );
};