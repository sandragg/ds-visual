import * as React from 'react';
import './about-page.css';

export const AboutPage = () => {
    return (
    <>
        <section className="section">
            <article className="about-card">
                <h1>About us</h1>
                <p><b>DS Visual</b> - DCV (data structure visualizer) - service for visualization of data structures and algorithms of work with them.</p>
                <p><i>For whom it will be useful?</i><br />
                The primary purpose of DS Visual is to assist in the study of data structures and ADT.
                Among main advantages are:</p>
                <ul>
                    <li>Visualized examples that will help to quickly understand how the basic structures are built and work;</li>
                    <li>Possibility to create structures from scratch or from a ready-made dataset;</li>
                    <li>Basic methods for structure modifying;</li>
                    <li>Familiarization with the complexity of the algorithms;</li>
                </ul>
                <p>All points above can make your studing more easy and funny as well.</p>
                <p className="about-card__footer">Hurry up to try! We hope you will find the material useful.</p>
            </article>
        </section>
    </>
    );
};