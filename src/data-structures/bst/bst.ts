import { TrackedActions } from 'src/services/constants';
import { TrackedClassItem } from 'src/services/interface';
import { Node, NodeTrackedItems } from './node';
import { NodeRef } from './bst.interface';

/**
 * Binary search tree (BST).
 * BST stores a reference to the root node - the first, top node in the tree.
 * Structure stores nodes in a special order: the left child node has value less than the parent node
 * value, the right child node - greater.
 */
export class BST<VType> {
	/**
	 * Fake ID, which value is out of ids range (OUT_OF_DOMAIN < 0).
	 * Below `OUT_OF_DOMAIN` is used as the return value for the fail cases
	 * or as a flag that method didn't modify structure or node wasn't found etc.
	 * @static
	 * @readonly
	 * @public
	 */
	public static readonly OUT_OF_DOMAIN: number = -1;
	/**
	 * Structure which BST consists of.
	 * Property was created in order to wrap `Node` class and its methods for history tracking.
	 * @private
	 */
	private Node: new (...args: any[]) => NodeRef<VType> = Node;
	/**
	 * Reference to the root node.
	 * @private
	 */
	private _root: NodeRef<VType> = null;
	/**
	 * Tree height - the longest route from the root node to the leaf.
	 * @private
	 */
	private _treeHeight: number = 0;
	/**
	 * Get reference to the root node.
	 * @public
	 */
	public getRoot(): NodeRef<VType> {
		return this._root;
	}
	/**
	 * Get tree height.
	 * @public
	 */
	public getTreeHeight(): number {
		return this._treeHeight;
	}
	/**
	 * Insert a new node to the BST.
	 * @param value
	 * @return New node id
	 * @return BST.OUT_OF_DOMAIN If node with the same value already exists
	 */
	public insert(value: VType): number {
		if (!this._root) {
			this._root = this._addLeaf(value);
			this._treeHeight = 1;
			return this._root.id;
		}

		let node: NodeRef<VType> = this.getRoot();
		let nodeDepth: number = 1;
		let childType: string;

		while (true) {
			if (node.value === value) {
				return BST.OUT_OF_DOMAIN;
			}

			childType = node.value > value ? 'left' : 'right';
			if (!node[childType]) {
				if (this._treeHeight < ++nodeDepth) {
					this._treeHeight = nodeDepth;
				}
				node[childType] = this._addLeaf(value);
				return node[childType].id;
			}

			node = node[childType];
			nodeDepth++;
		}
	}
	/**
	 * Create BST leaf - node with no children.
	 * @private
	 * @param value
	 */
	private _addLeaf(value: VType): NodeRef<VType> {
		return new this.Node(value);
	}
}

/**
 * Array stores pairs [tracked_item, action_type] for the route history tracking.
 */
export const BstTrackedItems: TrackedClassItem[] = [
	['getRoot', TrackedActions.select],
	['_addLeaf', TrackedActions.new],
	['Node', NodeTrackedItems]
];
