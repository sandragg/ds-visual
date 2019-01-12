import * as React from 'react';
import { ROUTES } from 'src/services/routes';
import { NavLink } from 'react-router-dom';
import './header.css';
import logo from 'src/assets/images/logo.svg';

interface Props {
	to: string,
	children: any
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
		<Link to={ROUTES.HOME}>
			<img className="header__logo" src={logo} alt="logo" />
		</Link>
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
