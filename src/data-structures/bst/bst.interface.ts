import { Node } from './node';
import { BST } from './bst';

export type NodeRef<VType> = Node<VType> | null;
export type BstRef<VType> = BST<VType> | null;
