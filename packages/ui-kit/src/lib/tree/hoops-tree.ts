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
 * This class implements a tree view as an HTML custom element. You can
 * integrate it in your application using the `hoops-tree` tag.
 *
 * @todo maybe move it to a ui kit project since it is general.
 *
 * @export
 * @class Tree
 * @typedef {Tree}
 * @extends {LitElement}
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
   * This structure holds all the information needed by the tree to render the
   * nodes hierarchy.
   *
   * It uses the node keys as key and TreeEntryData as value.
   * Since this variable is reactive if you want to trigger an update when you
   * edit the data you need to reassign the member (ie: `this.entries = {...}`).
   * Alternatively you can use the updateEntries method to update the nodes.
   *
   * @public
   * @type {Record<number, TreeEntryData>}
   */
  @state()
  public entries: Record<number, TreeEntryData> = {};

  /**
   * This property holds the selected nodes in the tree.
   * It is a reactive property so in order to update the component you need to
   * reassign the value (ie: this.selected = [...])
   *
   * @public
   * @type {number[]}
   */
  @property({ attribute: false })
  public selected: number[] = [];

  /**
   * The tree context used to get the tree nodes data.
   * This is a reactive property that can be set externally but it cannot be
   * passed to the tag.
   *
   * To trigger an update when we edit the tree we need to reassign it.
   * Usually you will reassign it to itself (ie: this.tree = { ...this.tree }).
   *
   * @public
   * @type {TreeContext}
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
   * This is a syntactic sugar to improve readability of updating the entries.
   * this is equivalent to: `this.entries = { ...this.entries }`;
   *
   * @public
   */
  public updateEntries() {
    this.entries = { ...this.entries };
  }

  /**
   * This is a syntactic sugar to improve readability of updating the context.
   * this is equivalent to: `this.tree = { ...this.tree }`;
   *
   * @public
   */
  public updateContext() {
    this.tree = { ...this.tree };
  }

  /**
   * This is a syntactic sugar to improve readability of updating the selected.
   * this is equivalent to: `this.selected = [ ...this.selected ]`;
   *
   * @public
   */
  public updateSelected() {
    this.selected = [...this.selected];
  }

  /**
   * Loads the children for a given node.
   *
   * @public
   * @param {TreeEntryData} parent The entry corresponding to the parent
   */
  public loadChildrenData(parent: TreeEntryData) {
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
   * Expand a path through the tree.
   * Every node in the path will be expanded.
   *
   * @public
   * @param {number[]} nodePath The path to expand
   */
  public expandPath(nodePath: number[]) {
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
   * Trigger a refresh of the data for a given node.
   * Useful if data provided by the context has changed (child nodes added to it).
   * If node is not loaded, it does nothing since data will be properly loaded when expanded.
   *
   * @public
   * @param {number} nodeKey The key of the node to update
   */
  public refreshNodeData(nodeKey: number) {
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
   * Notify the tree a node has been removed from the context.
   * This will remove the node and all its children from the tree.
   * If the node is not loaded yet, it does nothing.
   *
   * @public
   * @param {number} nodeKey The key of the removed node
   */
  public removeNode(nodeKey: number) {
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

  public resetTree() {
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
   * When a node is expanded we load is children in the tree structure so we do
   * not build the whole tree at start.
   *
   * We do not remove the nodes from the parent is collapsed but this can be
   * implemented by adding a listener to the tree.
   *
   * @private
   * @param {TreeNodeExpandEvent} event
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
   * Generate the HTML template for a node structure.
   *
   * This function is recursive, it will call itself for each child of the node
   * it visits up to the point where there is either no children (node is a
   * leaf) or the children have not been loaded (parent never expanded).
   *
   * @private
   * @param {?TreeEntryData} [nodeData] The entry corresponding to the node in entries
   * @returns {(HTMLTemplateResult | typeof nothing)} a HTML template for the node
   * with support to expanding and click.
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
   * Get the root node data. If the entries for this node is not created yet
   * this function creates it
   *
   * @private
   * @param {number} rootKey The key for the root node
   * @returns {Record<number, TreeEntryData>}
   */
  private getRootNodeData(rootKey: number) {
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
