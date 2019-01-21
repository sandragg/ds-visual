import * as React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from 'src/services/routes';
import './info-page.css';
import arrow from 'src/assets/images/arrow.svg';

export const InfoPage = () => (
    <section className="section info-section">
    	<article className="info-section__card">
            <div className="info__title__container">
                <Link to={ROUTES.ALGS_AND_DS}>
                    <img src={arrow} alt="arrow" />
                </Link>
                <h1 className="info__title">About us</h1>
            </div>
        </article>
    </section>
);