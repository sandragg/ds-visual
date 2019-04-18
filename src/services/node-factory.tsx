import React from 'react';
import { Node } from 'src/components/node';
import { RefField, ValueField } from 'src/components/node-fields';
import {
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

interface SubsequentNodeFactoryConfig {
	sequence: {
		direction: Direction,
		reverse: boolean
	},
	node: {
		fields: { [key: string]: FieldType },
		direction: Direction,
		offset: number
	}
}

const defaultConfig: SubsequentNodeFactoryConfig = {
	sequence: {
		direction: Direction.horizontal,
		reverse: false
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

	private readonly sequenceDirection: Direction;
	private readonly isSequenceReverse: boolean;
	private readonly nodeDirection: Direction;
	private readonly fields: FieldType[] = [];
	private readonly keys: string[] = [];

	constructor(config: SubsequentNodeFactoryConfig = defaultConfig) {
		const { sequence, node } = config;
		const { fields } = node;

		this.config = config;
		this.nodeDirection = node.direction;
		this.sequenceDirection = sequence.direction;
		this.isSequenceReverse = sequence.reverse;

		for (let key in fields) {
			this.keys.push(key);
			this.fields.push(fields[key]);
		}

		const [ width, height ] = calculateNodeSize(this.fields, node.direction);
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
		const isHoriz = this.sequenceDirection === Direction.horizontal;
		const k = this.isSequenceReverse ? -1 : 1;

		return {
			x: isHoriz ? k * index * (this.width + this.offset) : 0,
			y: isHoriz ? 0 : k * index * (this.height + this.offset)
		}
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
}

function calculateNodeSize(fields: FieldType[], direction: Direction): number[] {
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
