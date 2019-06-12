import React from 'react';
import 'src/App.css';
import { PictureCard } from 'src/components/card';
import './guide-page.css';
import firstStep from 'src/assets/images/1.png';
import secondStep from 'src/assets/images/2.png';
import thirdStep from 'src/assets/images/3.png';
import fourthStep from 'src/assets/images/5.png';
import fifthStep from 'src/assets/images/4.png';
import sixthStep from 'src/assets/images/6.png';

export const GuidePage = () => (
		<section className="section guide-section">
			<article className="about-section__card">
				<h1 className="card__title">Руководство</h1>
				<p>
					В настройках выберите не более трех требуемых представлений АТД:
				</p>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={firstStep}
				/>
				<p>
					Для работы с АТД используйте набор основных операций в нижней панели страницы.
					Центральное поле требуется для ввода параметров операции.
					В поле слева отображаются результат выполнения операции или текст ошибки.
				</p>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={secondStep}
				/>
				<p>
					Визуализация нескольких представлений АТД одновременно на экране позволяет легко сравнивать
					особенности реализации операций и хранения данных на разных структурах:
				</p>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={thirdStep}
				/>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={fourthStep}
				/>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={fifthStep}
				/>
				<p>
					С помощью контролов можно останавливать анимацию и перематывать шаги операции,
					выполняющейся в данный момент:
				</p>
				<PictureCard
						className="picture-container"
						pictureOnly
						picPath={sixthStep}
				/>
			</article>
		</section>
);
