import * as React from 'react';
import './home-page.css';
import { DirectionArrow } from '../../components/direction-arrow';
import { CardList } from '../../components/card-list/card-list';
import bst from 'src/assets/images/bst.svg';
import linkedList from 'src/assets/images/linked-list.svg';
import dsv from 'src/assets/images/dsv.svg';
import boxes from 'src/assets/images/boxes.svg';

const struct = [
	{
		id: 1,
		picPath: bst,
		title: 'BST',
		description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
							ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
							represented as a set of linked nodes.`
	},
	{
		id: 2,
		picPath: linkedList,
		title: 'Linked List',
		description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
							ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
							represented as a set of linked nodes.`
	},
	{
		id: 3,
		picPath: 'https://e3.edimdoma.ru/data/recipes/0006/0497/60497-ed4_wide.jpg',
		title: 'Tree',
		description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
							ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
							represented as a set of linked nodes.`
	},
	{
		id: 4,
		picPath: 'https://e3.edimdoma.ru/data/recipes/0006/0497/60497-ed4_wide.jpg',
		title: 'Tree',
		description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
							ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
							represented as a set of linked nodes.`
	},
	{
		id: 5,
		picPath: 'https://e3.edimdoma.ru/data/recipes/0006/0497/60497-ed4_wide.jpg',
		title: 'Tree',
		description: `In computer science, a tree is a widely used abstract data type (ADT) — or data structure implementing this
							ADT—that simulates a hierarchical tree structure, with a root value and subtrees of children with a parent node,
							represented as a set of linked nodes.`
	}
];

export const HomePage = () => {
	return (
		<>
			<section className="section homepage-section">
				<div className="title-container">
					<img className="homepage-section__title" src={dsv} alt="Title" />
					<h2 className="homepage-section__subtitle">a service for visualizing<br /> data structures and<br /> algorithms.</h2>
				</div>
				<figure className="homepage-section__boxes">
					<div className="boxes__background" />
					<img className="boxes__img" src={boxes} alt="" />
				</figure>
			</section>
			<DirectionArrow>LET’S START!</DirectionArrow>
			<section className="section structure-list-section">
				<CardList listType="presentation" cards={struct} />
			</section>
		</>
	);
};
