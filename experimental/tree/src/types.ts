/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export const enum TreeNodeHandle {
    root = 0,
    none = -429496729,      // Largest negative Int32 that satisfies 'TreeNodeIndex.none / ShapeFieldOffset.fieldCount'.
}

export type TreeNode = number & { readonly TreeNode: unique symbol };

export const TreeNode: { readonly root: TreeNode, readonly none: TreeNode } = {
    get root(): TreeNode { return TreeNodeHandle.root as TreeNode },
    get none(): TreeNode { return TreeNodeHandle.none as TreeNode }
}

export type TreeNodeLocation = number & { readonly TreeNodeLocation: unique symbol }

export const TreeNodeLocation: { readonly none: TreeNodeLocation } = {
    get none(): TreeNodeLocation { return -(TreeNodeHandle.none) as TreeNodeLocation }
}

export interface ITreeShapeProducer {
    /**
     * Acquire a reader for this tree's shape and implicitly subscribe the consumer
     * to shape change notifications.
     *
     * @param consumer - The consumer to be notified of Tree changes.
     */
    openTree(consumer: ITreeShapeConsumer): ITreeShapeReader;

    /**
     * Unsubscribe the consumer from this tree's shape notifications.
     *
     * @param consumer - The consumer to unregister from the Tree shape.
     */
    closeTree(consumer: ITreeShapeConsumer): void;
}

export interface ITreeShapeConsumer {
    nodeMoved(node: TreeNode, oldLocation: TreeNodeLocation, producer: ITreeShapeProducer): void;
}

export interface ITreeShapeReader {
    beforeNode(node: TreeNode): TreeNodeLocation;
    afterNode(node: TreeNode): TreeNodeLocation;
    firstChildOf(node: TreeNode): TreeNodeLocation;
    lastChildOf(node: TreeNode): TreeNodeLocation;
    parentOfLocation(location: TreeNodeLocation): TreeNode;

    /** The parent of the given 'node', or `TreeNode.null` if detached. */
    getParent(node: TreeNode): TreeNode;

    /** The first child of the given 'parent', or `TreeNode.null` if none.  (Leaf nodes return `TreeNode.null`.) */
    getFirstChild(parent: TreeNode): TreeNode;

    /** The last child of the given 'parent', or `TreeNode.null` if none.  (Leaf nodes return `TreeNode.null`.) */
    getLastChild(parent: TreeNode): TreeNode;

    /** The next sibling of the given 'node', or `TreeNode.null` if none. */
    getNextSibling(node: TreeNode): TreeNode;

    /** The previous sibling of the given 'node', or `TreeNode.null` if none. */
    getPrevSibling(node: TreeNode): TreeNode;
}

export interface ITreeShapeWriter {
    moveNode(parent: TreeNode, newlocation: TreeNodeLocation): void;
}

export interface ITreeProducer<T = unknown> extends ITreeShapeProducer {
    /**
     * Acquire a reader for this tree's shape and implicitly subscribe the consumer
     * to shape change notifications.
     *
     * @param consumer - The consumer to be notified of Tree changes.
     */
    openTree(consumer: ITreeConsumer): ITreeReader<T>;

    /**
     * Unsubscribe the consumer from this tree's shape notifications.
     *
     * @param consumer - The consumer to unregister from the Tree shape.
     */
    closeTree(consumer: ITreeConsumer): void;
}

export interface ITreeConsumer extends ITreeShapeConsumer {
    nodeChanged(node: TreeNode, producer: ITreeProducer<unknown>): void;
}

export interface ITreeReader<T> extends ITreeShapeReader {
    getNode(node: TreeNode): T;
}

export interface ITreeWriter<T> {
    setNode(node: TreeNode, value: T): void;
}
