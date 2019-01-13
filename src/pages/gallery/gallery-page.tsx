import * as React from 'react';
import { InfoCard } from '../../components/card';

const struct = {
	picPath: 'https://e3.edimdoma.ru/data/recipes/0006/0497/60497-ed4_wide.jpg',
	title: 'Tree',
	description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
						ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
						represented as a set of linked nodes.`
};

export const GalleryPage = () => {
	return (
		<div>
			<InfoCard
				picPath={struct.picPath}
				picCaption={struct.title}
			>
				{struct.description}
			</InfoCard>
		</div>
	);
};