import React from 'react';
import { Node } from 'src/components/node';
import { RefField, ValueField } from 'src/components/node-fields';
import {
	Direction,
	FieldHeight,
	FieldType,
	FieldWidth
} from 'src/services/constants';
import { NodeFactory, NodeProps } from 'src/services/interface';

class ArrayElementFactory implements NodeFactory {
	public direction: Direction;
	public fields: FieldType[];
	public width: number;
	public height: number;

	constructor(fields: FieldType[], direction: Direction = Direction.horizontal) {
		this.fields = fields;
		this.direction = direction;

		const [ width, height ] = calculateSize(fields, direction);
		this.width = width;
		this.height = height;

		this.component = this.component.bind(this);
	}

	public component({ children, nodeRef, attrs }: NodeProps) {
		const isHoriz = this.direction === Direction.horizontal;
		let offset = 0;

		return (
			<Node
				nodeRef={nodeRef}
				attrs={attrs}
			>
				{
					this.fields.map(field => {
						const childrenAttrs = {
							x: isHoriz ? offset : 0,
							y: isHoriz ? 0 : offset,
							width: !isHoriz && FieldWidth[FieldType.value],
							fill: attrs.fill
						};

						offset += isHoriz ? FieldWidth[field] : FieldHeight;

						return (
							field === FieldType.value
								? <ValueField attrs={childrenAttrs}>{children}</ValueField>
								: <RefField attrs={childrenAttrs} />
						);
					})
				}
			</Node>
		)
	}
}

function calculateSize(fields: FieldType[], direction: Direction): number[] {
	return direction === Direction.vertical
			? [ FieldWidth[FieldType.value], fields.length * FieldHeight ]
			: [
				fields.reduce((width, field) => width += FieldWidth[field], 0),
				FieldHeight
			];
}

export { ArrayElementFactory };
