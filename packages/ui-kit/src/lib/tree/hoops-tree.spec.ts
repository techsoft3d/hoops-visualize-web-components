import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { html } from 'lit';

import { renderTemplate, tick } from '../testing/utils';
import './hoops-tree';
import Tree from './hoops-tree';

describe('hoops-tree', () => {
  beforeEach(async () => {
    await renderTemplate(html`<hoops-tree></hoops-tree>`);
    const tree = document.querySelector('hoops-tree') as Tree;

    const rootKey = 0;
    const childrenMap = new Map<number, number[]>([
      [0, [1]],
      [1, [2, 3]],
      [2, [4]],
    ]);

    tree.tree = {
      context: {
        expandedIcon: html`<div>expanded</div>`,
        collapsedIcon: html`<div>collapsed</div>`,

        getRoot: () => rootKey,
        getChildren: (key: number) => childrenMap.get(key) ?? [],
        getContent: () => html`<div>content</div>`,
      },
    };

    await tick();
  });

  afterEach(async () => {
    await renderTemplate(html`<div></div>`);
    await tick();
  });

  it('should expand the nodes along the given path', async () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    tree.expandPath([0, 1, 2]);

    await tick();

    expect(tree.entries[0].expanded).toBe(true);
    expect(tree.entries[1].expanded).toBe(true);
    expect(tree.entries[2].expanded).toBe(true);
    expect(tree.entries[3].expanded).toBe(false);
    expect(tree.entries[4].expanded).toBe(false);
  });

  it('should throw an error if the path to expand is invalid', () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    expect(() => tree.expandPath([0, 99])).toThrow(
      `Unable to expand the path in the tree. Path 0,99 is invalid. 99 didn't found`,
    );
  });

  it('should refresh the data of the given node if already loaded', async () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    const rootKey = 0;
    const childrenMap = new Map<number, number[]>([
      [0, [1]],
      [1, [2, 3]],
      [2, [4]],
    ]);

    tree.tree = {
      context: {
        expandedIcon: html`<div>expanded</div>`,
        collapsedIcon: html`<div>collapsed</div>`,

        getRoot: () => rootKey,
        getChildren: (key: number) => childrenMap.get(key) ?? [],
        getContent: () => html`<div>content</div>`,
      },
    };

    tree.expandPath([0, 1, 2]);
    await tick();
    childrenMap.set(1, [2, 3, 5]);
    tree.refreshNodeData(1);
    await tick();

    expect(tree.entries[1].children).toEqual([2, 3, 5]);
  });

  it('should not refresh the data of the given node if not loaded yet', async () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    const rootKey = 0;
    const childrenMap = new Map<number, number[]>([
      [0, [1]],
      [1, [2, 3]],
      [2, [4]],
    ]);

    tree.tree = {
      context: {
        expandedIcon: html`<div>expanded</div>`,
        collapsedIcon: html`<div>collapsed</div>`,

        getRoot: () => rootKey,
        getChildren: (key: number) => childrenMap.get(key) ?? [],
        getContent: () => html`<div>content</div>`,
      },
    };

    await tick();
    childrenMap.set(1, [2, 3, 5]);
    tree.refreshNodeData(1);
    await tick();

    expect(tree.entries[1]).toBeUndefined();
  });

  it('should refresh the data if a node is removed', async () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    const rootKey = 0;
    const childrenMap = new Map<number, number[]>([
      [0, [1]],
      [1, [2, 3]],
      [2, [4]],
    ]);

    tree.tree = {
      context: {
        expandedIcon: html`<div>expanded</div>`,
        collapsedIcon: html`<div>collapsed</div>`,

        getRoot: () => rootKey,
        getChildren: (key: number) => childrenMap.get(key) ?? [],
        getContent: () => html`<div>content</div>`,
      },
    };

    tree.expandPath([0, 1, 2]);
    await tick();
    childrenMap.set(1, [3]);
    childrenMap.delete(2);
    tree.removeNode(2);
    await tick();

    expect(tree.entries[1].children).toEqual([3]);
    expect(tree.entries[2]).toBeUndefined();
    expect(tree.entries[4]).toBeUndefined();
  });

  it('should not refresh the data if the node removed is not loaded yet', async () => {
    const tree = document.querySelector('hoops-tree') as Tree;
    const rootKey = 0;
    const childrenMap = new Map<number, number[]>([
      [0, [1]],
      [1, [2, 3]],
      [2, [4]],
    ]);

    tree.tree = {
      context: {
        expandedIcon: html`<div>expanded</div>`,
        collapsedIcon: html`<div>collapsed</div>`,

        getRoot: () => rootKey,
        getChildren: (key: number) => childrenMap.get(key) ?? [],
        getContent: () => html`<div>content</div>`,
      },
    };

    await tick();
    childrenMap.set(1, [3]);
    childrenMap.delete(2);
    tree.removeNode(2);
    await tick();

    expect(tree.entries[1]).toBeUndefined();
    expect(tree.entries[2]).toBeUndefined();
    expect(tree.entries[4]).toBeUndefined();
  });
});
