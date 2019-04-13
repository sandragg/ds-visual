import React from 'react';
import { NextIcon } from 'src/components/icons';
import './breadcrumbs.css';

interface BreadcrumbsProps {
	chain: string[]
}

export const Breadcrumbs = ({ chain }: BreadcrumbsProps) => {
	const Divider = () => <NextIcon className="breadcrumbs__divider" />;

	return (
		<div className="breadcrumbs">
			{
				chain.reduce((res, link, index) => {
					if (index) {
						res.push(<Divider key={index} />);
					}
					res.push(<span key={index + link}>{link}</span>);

					return res;
				}, [])
			}
		</div>
	)
};
