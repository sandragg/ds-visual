import { TrackedActions } from 'src/services/constants';
import { TrackedClassItem } from 'src/services/interface';
import { NodeRef } from './bst.interface';

let idCounter: number = 0;

/**
 * Node for a binary search tree (BST).
 * Node stores a unique ID, value and references to both children.
 */
export class Node<VType> {
	/**
	 * Check passed reference validity. Value can be null or Node instance.
	 * If `ref` is valid then `ref` is returned, else - null.
	 * @static
	 * @private
	 * @param ref Reference to the node
	 */
	public static checkRefValidity(ref: NodeRef<any>): NodeRef<any> {
		return ref != null && ref instanceof Node ? ref : null;
	}
	/**
	 *  Node identification number.
	 *  Initialized in Node constructor by global counter.
	 *  @public
	 *  @readonly
	 */
	public readonly id: number;
	/**
	 *  Node value.
	 *  @public
	 */
	public value: VType;
	/**
	 *  Reference to the left child.
	 *  @public
	 */
	public left: NodeRef<VType>;
	/**
	 *  Reference to the right child.
	 *  @public
	 */
	public right: NodeRef<VType>;
	/**
	 * Create a new Node instance.
	 * Node is called a leaf if neither the left nor the right references
	 * have been passed (when both children are null).
	 * @constructor
	 * @param value
	 * @param left
	 * @param right
	 */
	constructor(value: VType, left?: NodeRef<VType>, right?: NodeRef<VType>) {
		this.id = idCounter++;
		this.value = value;
		this.left = Node.checkRefValidity(left);
		this.right = Node.checkRefValidity(right);
	}
}

/**
 * Array stores pairs [tracked_item, action_type] for the route history tracking.
 */
export const NodeTrackedItems: TrackedClassItem[] = [
	['left', TrackedActions.select],
	['right', TrackedActions.select]
];
