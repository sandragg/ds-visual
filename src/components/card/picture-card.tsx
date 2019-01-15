import React, { CSSProperties } from 'react';
import './picture-card.css';

interface Props {
	className?: string,
	style?: CSSProperties,
	pictureOnly?: boolean,
	picPath: string,
	picCaption?: string
}

const PictureCard = (props: Props) => {
	const { pictureOnly, picPath, picCaption, style, className = '' } = props;
	const interactive = pictureOnly ? '' : 'struct-pic_interact';

	return (
		<figure className={`${className} struct-pic ${interactive}`} style={style}>
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
