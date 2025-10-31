import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';

import { ViewAdapter, ViewTreeNodeId } from './ViewAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { Tree, ContextWrapper, type TreeNodeClickEvent } from '@ts3d-hoops/ui-kit/tree';

export type * from './custom-events.d.ts';

/**
 * This class implements the view tree web component. It has no property but it
 * has some members and methods. In order to set the model you can assign it to
 * HoopsViewTree.model and it will update automatically.
 *
 * It mainly relies on ViewAdapter and hoops-tree.
 * Thanks to hoops-tree, the nodes in the tree are lazy loaded, expansion and
 * selection are handle.
 *
 * Lazy loading allows better performance and memory consumption especially at
 * loading.
 *
 * @export
 * @class HoopsViewTree
 * @typedef {HoopsViewTree}
 * @extends {LitElement}
 */
@customElement('hoops-view-tree')
export class HoopsViewTreeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      .viewtree {
        height: 100%;
        overflow: auto;
      }
    `,
  ];

  /**
   * A reference to the `hoop-tree` element
   *
   * @private
   * @type {Ref<Tree>}
   */
  private treeRef = createRef<Tree>();

  /**
   * Get the Tree element
   *
   * This is a syntactic sugar to simplify getting the tree element and expose
   * it externally
   *
   * @readonly
   * @type {(Tree | undefined)}
   */
  get treeElement(): Tree | undefined {
    return this.treeRef.value;
  }

  /**
   * Get/Set the selected nodes
   *
   * This is a syntactic sugar to access Tree.selected.
   * If the Tree is not set it returns an empty array.
   *
   * Reassigning the selected will trigger an update.
   *
   * Trying to set the selected nodes while the tree is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the tree is added to the
   * view tree at initialization.
   *
   * @type {number[]}
   */
  get selected(): number[] {
    return this.treeElement?.selected ?? [];
  }

  set selected(value: number[]) {
    if (!this.treeElement) {
      throw new Error(`HoopsViewTree.selected [set]: Tree element is not set.`);
    }

    this.treeElement.selected = value;
  }

  /**
   * The IModel interface that represents the Model.
   *
   * This is a syntactic sugar to access HoopsViewTree.viewAdapter.model.
   * If the ViewAdapter is not set it returns an undefined.
   *
   * Reassigning the model will trigger an update.
   *
   * Trying to set the model while the viewAdapter is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the viewAdapter is added
   * to the view tree at initialization.
   *
   * @type {(IModel | undefined)}
   */
  get model(): IModel | undefined {
    return this.viewAdapter?.model;
  }

  set model(model: IModel | undefined) {
    const viewAdapter = this.viewAdapter;
    if (!viewAdapter) {
      throw new Error(`HoopsViewTree.model [set]: ViewAdapter is not set.`);
    }

    viewAdapter.model = model;
    this.viewAdapter = viewAdapter;
    this.resetTree();
  }

  /**
   * Get/Set the ViewAdapter
   *
   * This is a syntactic sugar to access tree.context
   * If the Tree is not set it returns undefined.
   *
   * Reassigning the viewAdapter will trigger an update.
   *
   * Trying to set the viewAdapter while the tree is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the tree is added to the
   * view tree at initialization.
   *
   * @public
   * @type {(ViewAdapter | undefined)}
   */
  public get viewAdapter(): ViewAdapter | undefined {
    return this.treeElement?.tree.context as ViewAdapter | undefined;
  }

  public set viewAdapter(value: ViewAdapter) {
    if (!this.treeElement) {
      throw new Error(`HoopsViewTree.viewAdapter [set]: Tree element is not set.`);
    }

    this.treeElement.tree = { context: value };
  }

  /**
   * Select a node in the Tree.
   *
   * @param {number[]} nodeIds The ids of the nodes to select
   * @param {boolean} selected Either to select or deselect the node
   */
  selectNodes(nodeIds: number[], selected: boolean): void {
    if (!this.treeElement) {
      throw new Error(`HoopsViewTree.selectNodes: Tree element is not set.`);
    }

    let selection = this.treeElement.selected;
    if (!selected) {
      selection = selection.filter((current) => !nodeIds.includes(current));
    } else {
      selection = nodeIds;
    }

    this.treeElement.selected = selection;
  }

  /**
   * In order to allow user to attach reactive data to the nodes this is a
   * shorthand to get the custom data for a node given its id.
   *
   * If the viewAdapter does not exist it will throw an Error.
   * Otherwise it will return the data if any or your node.
   *
   * @param {number} nodeId The id of the node that owns the data.
   * @returns {unknown} The data stored by the user.
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const viewAdapter = this.viewAdapter;
    if (!viewAdapter) {
      throw new Error(`HoopsViewTree.setNodeData [set]: ViewAdapter is not set.`);
    }

    return viewAdapter.nodesData[nodeId] as T;
  }

  /**
   * Set some custom data to a node. If the node had already a value it is
   * erased.
   *
   * Setting node data will trigger an update.
   *
   * If the viewAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
   */
  setNodeData(nodeId: number, data: unknown): void {
    const viewAdapter = this.viewAdapter;
    if (!viewAdapter) {
      throw new Error(`HoopsViewTree.setNodeData [set]: ViewAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`HoopsViewTree.setNodeData [set]: Tree element i
      s not set.`);
    }

    viewAdapter.nodesData[nodeId] = data;
    treeElm.tree = { ...treeElm.tree };
  }

  /**
   * Merge some custom data into a node's data. If the node did not have data,
   * it is added to the context.
   *
   * If the given data is an array and the context node data is an array, the
   * data passed as argument are appended to the context data.
   * If both are objects, then the objects are merged using Object.assign, with
   * the data argument being the last object of the merge.
   * Otherwise it is equivalent to setNodeData.
   *
   * Updating node data will trigger an update.
   *
   * If the viewAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
   */
  updateNodeData(nodeId: number, data: unknown): void {
    const viewAdapter = this.viewAdapter;
    if (!viewAdapter) {
      throw new Error(`HoopsViewTree.setNodeData [set]: ViewAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`HoopsViewTree.setNodeData [set]: Tree element is not set.`);
    }

    if (Array.isArray(data) && Array.isArray(viewAdapter.nodesData[nodeId])) {
      viewAdapter.nodesData[nodeId] = [...(viewAdapter.nodesData[nodeId] as any[]), ...data];
    } else if (
      typeof data === 'object' &&
      (!viewAdapter.nodesData[nodeId] || typeof viewAdapter.nodesData[nodeId] === 'object')
    ) {
      viewAdapter.nodesData[nodeId] = Object.assign(viewAdapter.nodesData[nodeId] ?? {}, data);
    } else {
      viewAdapter.nodesData[nodeId] = data;
    }

    viewAdapter.nodesData[nodeId] = Object.assign(viewAdapter.nodesData[nodeId] ?? {}, data);
    treeElm.tree = { ...treeElm.tree };
  }

  private resetTree() {
    this.treeRef.value?.resetTree();
    this.treeRef.value?.expandPath([ViewTreeNodeId.RootNode]);
  }

  protected override render(): unknown {
    return html`<hoops-tree
      class="viewtree"
      .tree=${{ context: new ViewAdapter() } as ContextWrapper}
      @hoops-tree-node-click=${(event: TreeNodeClickEvent) => {
        event.stopPropagation();
        const { key, ...detail } = event.detail;
        // Do not dispatch the event if a non-view node is clicked
        if (
          [
            ViewTreeNodeId.RootNode,
            ViewTreeNodeId.AnnotationViewsNode,
            ViewTreeNodeId.CombineStateViewsNode,
            ViewTreeNodeId.StandardViewsNode,
          ].includes(key)
        ) {
          return;
        }
        this.dispatchEvent(
          new CustomEvent('hoops-view-tree-node-click', {
            bubbles: true,
            composed: true,
            detail: {
              nodeId: key,
              ...detail,
            },
          }),
        );
      }}
      ${ref(this.treeRef)}
    ></hoops-tree>`;
  }
}

export default HoopsViewTreeElement;
