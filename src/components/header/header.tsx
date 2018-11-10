import * as React from 'react';
import './header.css';

interface Props {
	props?: any
}

const Header = (props: Props) => (
	<header className="header header_main">
		{/*Need LOGO remove*/}
		<div />
		{/*Need LOGO remove*/}

		<nav className="header__nav">
			<a className="nav__link nav__link_active" href="#">Home</a>
			<a className="nav__link" href="#">Algorithms and Data Structures</a>
			<a className="nav__link" href="#">Visualization</a>
			<a className="nav__link" href="#">About us</a>
		</nav>
	</header>
);

export { Header };
