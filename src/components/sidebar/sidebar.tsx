import React, {
	FunctionComponent,
	useState,
	useCallback
} from 'react';
import { IconButton } from 'src/components/button';
import { SettingsIcon } from 'src/components/icons';
import './sidebar.css';

const SideBar: FunctionComponent = ({ children }) => {
	const [ isOpen, setIsOpen ] = useState<boolean>(false);
	const openSidebarClassName = isOpen ? 'slide-column_visible' : '';

	const toggleSidebar = useCallback(
			() => setIsOpen(!isOpen),
			[isOpen]
	);

	return (
		<section className={`section sidebar slide-column ${openSidebarClassName}`}>
			<IconButton
				className="sidebar-control"
				onClick={toggleSidebar}
			>
				<SettingsIcon />
			</IconButton>
			{children}
		</section>
	)
};

export { SideBar };
