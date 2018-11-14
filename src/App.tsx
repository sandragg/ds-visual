import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { ROUTES } from './services/routes';
import { Header } from './components/header/header';

const App = () => {
	return (
		<BrowserRouter>
			<div className="App">
				<Header />
				<main>
					<Route exact path={ROUTES.HOME} />
					<Route path={ROUTES.ALGS_AND_DS} />
					<Route path={ROUTES.ABOUT} />
				</main>
			</div>
		</BrowserRouter>
	);
};

export default App;
