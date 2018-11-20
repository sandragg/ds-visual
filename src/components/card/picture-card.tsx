import * as React from 'react';
import './picture-card.css';

interface Props {
	className?: string,
	pictureOnly?: boolean,
	picPath: string,
	picCaption?: string
}

const PictureCard = (props: Props) => {
	const { className = '', pictureOnly, picPath, picCaption } = props;
	const interactive = pictureOnly ? '' : 'struct-pic_interact';

	return (
		<figure className={`${className} struct-pic ${interactive}`}>
			<img
				className="struct-pic__img"
				alt="structure image"
				src={picPath}
			/>
			{
				pictureOnly
					? null
					: <figcaption className="struct-pic__caption">{picCaption}</figcaption>
			}
		</figure>
	);
};

export { PictureCard };
