import { provide } from '@lit/context';
import { HTMLTemplateResult, LitElement, css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { downIcon, rightIcon } from '../icons';
import type { ContextWrapper } from './context';
import { treeContext } from './context';

import './hoops-tree-node';
import type { TreeNodeExpandEvent } from './custom-events.d.ts';
import { TreeEntryData } from './types';

/**
 * Provides a tree view component for displaying hierarchical data structures.
 *
 * @element hoops-tree
 *
 * @example
 * ```html
 * <hoops-tree></hoops-tree>
 *
 * <script>
 *   const tree = document.getElementsByTagName("hoops-tree")[0];
 *   tree.tree = {
 *     context: {
 *       expandedIcon: '▼',
 *       collapsedIcon: '▶',
 *       getRoot: () => 0,
 *       getChildren: (key) => key === 0 ? [1, 2] : [],
 *       getContent: (key) => `Node ${key}`,
 *       isSelected: (key) => tree.selected.includes(key)
 *     }
 *   };
 *   tree.selected = [1];
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-tree')
export default class Tree extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }

      .tree {
        width: 100%;
        height: 100%;
      }
    `,
  ];

  /**
   * Holds all tree node data needed for rendering the hierarchy.
   * Maps node keys to TreeEntryData. Reassign to trigger updates.
   *
   * @default {}
   */
  @state()
  public entries: Record<number, TreeEntryData> = {};

  /**
   * Array of selected node keys. Reassign to trigger updates.
   *
   * @default []
   */
  @property({ attribute: false })
  public selected: number[] = [];

  /**
   * Context wrapper providing tree data access methods. Reassign to trigger updates.
   */
  @provide({ context: treeContext })
  @property({ attribute: false })
  public tree = {
    context: {
      // default implementation to have the tree mounting
      expandedIcon: html`${downIcon}`,
      collapsedIcon: html`${rightIcon}`,

      getRoot: () => Number.NaN,
      getChildren: () => [],
      getContent: () => nothing,

      isSelected: () => false,
    },
  } as ContextWrapper;

  /**
   * Triggers a re-render by reassigning entries.
   *
   * @returns void
   */
  public updateEntries(): void {
    this.entries = { ...this.entries };
  }

  /**
   * Triggers a re-render by reassigning tree context.
   *
   * @returns void
   */
  public updateContext(): void {
    this.tree = { ...this.tree };
  }

  /**
   * Triggers a re-render by reassigning selected entries.
   *
   * @returns void
   */
  public updateSelected(): void {
    this.selected = [...this.selected];
  }

  /**
   * Loads and registers child nodes for a parent node.
   *
   * @param parent - The parent node entry
   * @returns void
   */
  public loadChildrenData(parent: TreeEntryData): void {
    /*
      For each children we create an entry and we add it to `this.entries` if it
      is not yet loaded.
      If the node is not loaded it does not alter it.
     */
    const data = parent.children.map(
      (key): TreeEntryData => ({
        key,
        parentKey: parent.key,
        children: this.tree.context.getChildren(key),
        expanded: false,
      }),
    );

    for (const d of data) {
      this.entries[d.key] = this.entries[d.key] ?? d;
    }

    this.updateEntries();
  }

  /**
   * Expands all nodes along the specified path.
   *
   * @param nodePath - Array of node keys representing the path to expand
   * @returns void
   * @throws Error when a node in the path is not found
   */
  public expandPath(nodePath: number[]): void {
    const rootKey = this.tree?.context.getRoot() ?? Number.NaN;
    if (isNaN(rootKey)) {
      return;
    }
    this.getRootNodeData(rootKey);

    for (const key of nodePath) {
      if (!this.entries[key]) {
        throw new Error(
          `Unable to expand the path in the tree. Path ${nodePath} is invalid. ${key} didn't found`,
        );
      }
      const nodeData = this.entries[key];
      this.loadChildrenData(nodeData);
      nodeData.expanded = true;
    }
    this.updateEntries();
  }

  /**
   * Refreshes node data from context. No-op if node is not loaded.
   *
   * @param nodeKey - The key of the node to refresh
   * @returns void
   */
  public refreshNodeData(nodeKey: number): void {
    // The node is not even loaded yet
    // We can skip and the node will be loaded properly when expanded
    if (!this.entries[nodeKey]) {
      return;
    }

    const nodeData = this.entries[nodeKey];
    nodeData.children = this.tree.context.getChildren(nodeKey);
    this.loadChildrenData(nodeData);
  }

  /**
   * Removes a node and all its children from the tree. No-op if node is not loaded.
   *
   * @param nodeKey - The key of the node to remove
   * @returns void
   */
  public removeNode(nodeKey: number): void {
    // Try to find the parent
    const parent = Object.entries(this.entries).find(([, entry]) => {
      return entry.children.includes(nodeKey);
    });

    // No parent, we can skip, the node is not loaded yet
    if (!parent) {
      return;
    }

    // Delete the node and all its children (if exist)
    const childrenToDelete = [nodeKey];
    while (childrenToDelete.length > 0) {
      const key = childrenToDelete.pop();
      if (!key) {
        continue;
      }

      const entry = this.entries[key];
      if (!entry) {
        continue;
      }
      childrenToDelete.push(...entry.children);
      delete this.entries[key];
    }

    // Remove the child from the parent
    parent[1].children = parent[1].children.filter((key) => key !== nodeKey);

    // Tree has changed -> need an update
    this.updateEntries();
  }

  /**
   * Resets the tree to its initial state, clearing all entries and selections.
   *
   * @returns void
   */
  public resetTree(): void {
    this.entries = {};
    this.selected = [];
  }

  protected override render(): unknown {
    const rootKey = this.tree?.context.getRoot() ?? Number.NaN;
    if (Number.isNaN(rootKey)) {
      /*
        If the root key is not defined we just render an empty div for the tree
       */
      return html`<div class="tree"></div>`;
    }

    const rootData = this.getRootNodeData(rootKey);

    return html`<div class="tree" @hoops-tree-node-expand=${this.handleNodeExpanded}>
      ${this.getNode(rootData)}
    </div>`;
  }

  /**
   * Handles node expansion events and loads children on demand.
   *
   * @internal
   * @param event - The tree node expand event
   */
  private handleNodeExpanded(event: TreeNodeExpandEvent): void {
    this.entries[event.detail.key].expanded = event.detail.expanded;
    if (event.detail.expanded) {
      this.loadChildrenData(this.entries[event.detail.key]);
    } else {
      this.updateEntries();
    }
  }

  /**
   * Recursively generates HTML template for a node and its loaded children.
   *
   * @internal
   * @param nodeData - Optional node entry data
   * @returns HTML template for the node or nothing if node is not loaded
   */
  private getNode(nodeData?: TreeEntryData): HTMLTemplateResult | typeof nothing {
    if (!nodeData) {
      /*
        If the entry is not in the map (node has not been loaded) then we return
        `nothing`, a special value to tell lit not to render any html.
       */
      return nothing;
    }

    return html`<hoops-tree-node
      class="node"
      key=${nodeData.key}
      ?expanded=${nodeData.expanded}
      ?selected=${this.selected.includes(nodeData.key)}
      ?leaf=${!nodeData.children.length}
    >
      ${nodeData.children.map((child) => this.getNode(this.entries[child]))}
    </hoops-tree-node>`;
  }

  /**
   * Gets or creates the root node entry data.
   *
   * @internal
   * @param rootKey - The key for the root node
   * @returns The root node entry data
   */
  private getRootNodeData(rootKey: number): TreeEntryData {
    if (!this.entries[rootKey]) {
      this.entries[rootKey] = {
        key: rootKey,
        expanded: false,
        children: this.tree.context.getChildren(rootKey),
      };
    }

    return this.entries[rootKey];
  }
}
