import * as React from 'react';
import { ROUTES } from '../../services/routes';
import { NavLink } from 'react-router-dom';
import './header.css';
import logo from '../../assets/images/logo.png';

interface Props {
	to: string,
	children: string
}

const Link = ({ to, children }: Props) => (
		<NavLink
				exact
				className="nav__link"
				activeClassName="nav__link_active"
				to={to}
		>
			{children}
		</NavLink>
);

const Header = () => (
	<header className="header header_main">
		{/* TODO Need LOGO remove*/}
		<div><img className="header__logo" src={logo} alt="logo" /></div>
		{/*Need LOGO remove*/}

		<nav className="header__nav">
			<Link to={ROUTES.HOME}>
				Home
			</Link>
			<Link to={ROUTES.ALGS_AND_DS}>
				Algorithms and Data Structures
			</Link>
			<Link to={ROUTES.ABOUT}>
				About us
			</Link>
		</nav>
	</header>
);

export { Header };
