import * as React from 'react';
import './about-page.css';

export const AboutPage = () => (
		<section className="section about-section">
			<article className="about-section__card">
				<h1 className="card__title">About us</h1>
				<p>
					<b>DS Visual</b> - DCV (data structure visualizer) - service for visualization of data structures and algorithms of work with them.
				</p>
				<p>
					<i>For whom it will be useful?</i><br />
					The primary purpose of DS Visual is to assist in the study of data structures and ADT.
				</p>
				<p>Among main advantages are:</p>
				<ul className="card__list">
					<li>Visualized examples that will help to quickly understand how the basic structures are built and work;</li>
					<li>Possibility to create structures from scratch or from a ready-made dataset;</li>
					<li>Basic methods for structure modifying;</li>
					<li>Familiarization with the complexity of the algorithms;</li>
				</ul>
				<p>All points above can make your studing more easy and funny as well.</p>
				<footer className="card__footer">Hurry up to try! We hope you will find the material useful.</footer>
			</article>
		</section>
);
