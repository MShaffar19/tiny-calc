/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Handle, HandleTable } from "@tiny-calc/handletable";
import { GraphNode, IGraphShapeConsumer, IGraphShapeProducer, IGraphShapeReader, IGraphShapeWriter } from "./types";
import { strict as assert } from "assert";
import { addConsumer, ConsumerSet, forEachConsumer, removeConsumer } from "./consumerset";

export class GraphShape implements IGraphShapeProducer, IGraphShapeReader, IGraphShapeWriter {
    private readonly nodeToChildren = new HandleTable<GraphNode[]>();
    private consumers?: ConsumerSet<IGraphShapeConsumer>;

    public constructor() {
        const root = this.createNode();

        assert.equal(root, GraphNode.root);
    }

    // #region IGraphShapeProducer

    public openGraph(consumer: IGraphShapeConsumer): IGraphShapeReader {
        this.consumers = addConsumer(this.consumers, consumer);
        return this;
    }

    public closeGraph(consumer: IGraphShapeConsumer): void {
        this.consumers = removeConsumer(this.consumers, consumer);
    }

    // #endregion IGraphShapeProducer

    // #region IGraphShapeReader

    public getChildCount(parent: GraphNode): number {
        return this.getChildren(parent).length;
    }

    public getChild(parent: GraphNode, index: number): GraphNode {
        return this.getChildren(parent)[index];
    }

    // #endregion IGraphShapeReader

    // #region IGraphShapeWriter

    public createNode(): GraphNode {
        return this.nodeToChildren.add([]) as unknown as GraphNode;
    }

    public deleteNode(node: GraphNode): void {
        // TODO: 'deleteNode()' leaves dangling references inside the graph's children collections.
        //       (In general, lifetime needs design work.)
        this.nodeToChildren.delete(node as unknown as Handle);
    }

    public spliceChildren(parent: GraphNode, start: number, removeCount: number, ...toInsert: GraphNode[]): void {
        this.getChildren(parent).splice(start, removeCount, ...toInsert);
        this.invalidateShape(parent, start, removeCount, toInsert.length);
    }

    // #endregion IGraphShapeWriter

    protected forEachConsumer(callback: (consumer: IGraphShapeConsumer) => void): void {
        forEachConsumer(this.consumers, callback);
    }

    private invalidateShape(parent: GraphNode, start: number, removedCount: number, insertCount: number): void {
        this.forEachConsumer((consumer) => {
            consumer.childrenChanged(parent, start, removedCount, insertCount, this);
        });
    }

    private getChildren(parent: GraphNode) {
        return this.nodeToChildren.get(parent as unknown as Handle);
    }
}