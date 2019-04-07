import React, {
	useState,
	useEffect
} from 'react';
import {
	RouteComponentProps,
	Redirect
} from 'react-router';
import { VisualizationPage } from './visualization-page';
import { ROUTES } from 'src/services/routes';
import { ADTConfig } from 'src/containers/adt';

// TODO temporary store
const idToDirectoryName = {
	3: 'stack'
};

interface PageParams {
	id: string
}

const VisualizationPageContainer = (props: RouteComponentProps<PageParams>) => {
	const { id } = props.match.params;
	const [ loaded, setLoaded ] = useState<ADTConfig>(null);
	const [ loading, setLoading ] = useState<boolean>(true);

	useEffect(
		() => {
			const dirName: string = idToDirectoryName[id];

			if (!dirName) {
				setLoading(false);
				return;
			}

			import(`../../containers/adt/${dirName}`)
				.then(obj => {
					setLoaded(obj.config || obj);
				})
				.catch(err => {
					throw err;
				})
				.finally(() => {
					setLoading(false);
				});
		},
		[]
	);

	if (loading) {
		return null;
	}

	return loaded === null
			? <Redirect to={ROUTES.ALGS_AND_DS} />
			: <VisualizationPage config={loaded} {...props} />
};

export default VisualizationPageContainer;
