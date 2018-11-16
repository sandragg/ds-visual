import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { ROUTES } from './services/routes';
import { Header } from './components/header/header';
import * as Pages from './pages';

const App = () => {
	return (
		<BrowserRouter>
			<div className="App">
				<Header />
				<main>
					<Route exact path={ROUTES.HOME} component={Pages.HomePage} />
					<Route path={ROUTES.ALGS_AND_DS} component={Pages.GalleryPage} />
					<Route path={ROUTES.ABOUT} component={Pages.InfoPage} />
				</main>
			</div>
		</BrowserRouter>
	);
};

export default App;
