import React from 'react';
import { Node } from 'src/components/node';
import { RefField, ValueField } from 'src/components/node-fields';
import {
	Position,
	Direction,
	FieldHeight,
	FieldType,
	FieldWidth
} from 'src/services/constants';
import {
	NodeFactory,
	NodeProps,
	Point
} from 'src/services/interface';
import {
	calculatePointByOffsetPosition,
	getDirectionByPosition
} from 'src/utils/positioning';

interface SubsequentNodeFactoryConfig {
	sequence: {
		position: Position
	},
	node: {
		fields: { [key: string]: FieldType },
		direction: Direction,
		offset: number
	}
}

const defaultConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		position: Position.right
	},
	node: {
		fields: {
			value: FieldType.value
		},
		direction: Direction.horizontal,
		offset: 0
	}
};

class SubsequentNodeFactory implements NodeFactory {
	public readonly config: SubsequentNodeFactoryConfig;
	/* Node size */
	public readonly width: number;
	public readonly height: number;
	public readonly offset: number;
	public readonly sequencePosition: Position;

	private readonly nodeDirection: Direction;
	private readonly fields: FieldType[] = [];
	private readonly keys: string[] = [];

	constructor(config: SubsequentNodeFactoryConfig = defaultConfig) {
		const { sequence, node } = config;
		const { fields } = node;

		this.config = config;
		this.nodeDirection = node.direction;
		this.sequencePosition = sequence.position;

		for (let key in fields) {
			this.keys.push(key);
			this.fields.push(fields[key]);
		}

		const [ width, height ] = calculateNodeSize(this.fields, this.nodeDirection);
		this.width = width;
		this.height = height;
		this.offset = node.offset;

		this.component = this.component.bind(this);
	}

	public component({ children, nodeRef, attrs }: NodeProps) {
		const isHoriz = this.nodeDirection === Direction.horizontal;
		let fieldOffset = 0;

		return (
			<Node
					nodeRef={nodeRef}
					attrs={attrs}
			>
				{
					this.fields.map(field => {
						let childrenAttrs;

						if (isHoriz) {
							childrenAttrs = {
								x: fieldOffset,
								y: 0,
								fill: attrs.fill
							};
							fieldOffset += FieldWidth[field];
						}
						else {
							childrenAttrs = {
								x: 0,
								y: fieldOffset,
								width: FieldWidth[FieldType.value],
								fill: attrs.fill
							};
							fieldOffset += FieldHeight;
						}

						return (
							field === FieldType.value
								? <ValueField attrs={childrenAttrs}>{attrs.value != null ? attrs.value : children}</ValueField>
								: <RefField attrs={childrenAttrs} />
						);
					})
				}
			</Node>
		)
	}

	public getNodeCoords(index: number): Point {
		const isVertical = getDirectionByPosition(this.sequencePosition) === Direction.vertical;
		const offset = index * (this.offset + (isVertical ? this.height : this.width));

		return calculatePointByOffsetPosition(
			{ x: 0, y: 0 },
			this.sequencePosition,
			offset
		);
	}

	public getFieldCoords(nodeIndex: number, fieldKey: string): Point {
		const isHoriz = this.nodeDirection === Direction.horizontal;
		const nodeCoords = this.getNodeCoords(nodeIndex);
		const index = this.keys.indexOf(fieldKey);

		if (!isHoriz) {
			nodeCoords.y += FieldHeight * index;
		}
		else {
			for (let i = 0; i < index; i++) {
				nodeCoords.x += FieldWidth[this.fields[i]];
			}
		}

		return nodeCoords;
	}

	public getFieldSize(field: FieldType): [number, number] {
		return this.nodeDirection === Direction.vertical
				? [ FieldWidth[FieldType.value], FieldHeight ]
				: [ FieldWidth[field], FieldHeight ];
	}
}

function calculateNodeSize(fields: FieldType[], direction: Direction): [number, number] {
	return direction === Direction.vertical
			? [ FieldWidth[FieldType.value], fields.length * FieldHeight ]
			: [
				fields.reduce((width, field) => width += FieldWidth[field], 0),
				FieldHeight
			];
}

export {
	SubsequentNodeFactory,
	SubsequentNodeFactoryConfig
};
