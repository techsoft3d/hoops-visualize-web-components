import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { Tree, ContextWrapper } from '@ts3d-hoops/ui-kit/tree';

import ModelAdapter from './ModelAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

export type * from './custom-events.d.ts';

/**
 * This class implements the model tree web component. It has no property but it
 * has some members and methods. In order to set the model you can assign it to
 * ModelTree.model and it will update automatically.
 *
 * It mainly relies on ModelAdapter and hoops-tree.
 * Thanks to hoops-tree, the nodes in the tree are lazy loaded, expansion and
 * selection are handle.
 *
 * Lazy loading allows better performance and memory consumption especially at
 * loading.
 *
 * @export
 * @class ModelTree
 * @typedef {ModelTree}
 * @extends {LitElement}
 */
@customElement('hoops-model-tree')
export class HoopsModelTreeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      .modeltree {
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
   * model tree at initialization.
   *
   * @type {number[]}
   */
  get selected(): number[] {
    return this.treeElement?.selected ?? [];
  }

  set selected(value: number[]) {
    if (!this.treeElement) {
      throw new Error(`ModelTree.selected [set]: Tree element is not set.`);
    }

    this.treeElement.selected = value;
  }

  /**
   * The IModel interface that represents the Model.
   *
   * This is a syntactic sugar to access ModelTree.modelAdapter.model.
   * If the ModelAdapter is not set it returns an undefined.
   *
   * Reassigning the model will trigger a reset of the tree.
   *
   * Trying to set the model while the modelAdapter is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the modelAdapter is added
   * to the model tree at initialization.
   *
   * @type {(IModel | undefined)}
   */
  get model(): IModel | undefined {
    return this.modelAdapter?.model;
  }

  set model(model: IModel | undefined) {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`ModelTree.model [set]: ModelAdapter is not set.`);
    }

    modelAdapter.model = model;
    this.modelAdapter = modelAdapter;
    this.resetTree();
  }

  /**
   * Get/Set the ModelAdapter
   *
   * This is a syntactic sugar to access tree.context
   * If the Tree is not set it returns undefined.
   *
   * Reassigning the modelAdapter will trigger an update.
   *
   * Trying to set the modelAdapter while the tree is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the tree is added to the
   * model tree at initialization.
   *
   * @public
   * @type {(ModelAdapter | undefined)}
   */
  public get modelAdapter(): ModelAdapter | undefined {
    return this.treeElement?.tree.context as ModelAdapter | undefined;
  }

  public set modelAdapter(value: ModelAdapter) {
    if (!this.treeElement) {
      throw new Error(`ModelTree.modelAdapter [set]: Tree element is not set.`);
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
      throw new Error(`ModelTree.selectNodes: Tree element is not set.`);
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
   * If the modelAdapter does not exist it will throw an Error.
   * Otherwise it will return the data if any or your node.
   *
   * @param {number} nodeId The id of the node that owns the data.
   * @returns {unknown} The data stored by the user.
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`ModelTree.setNodeData [set]: ModelAdapter is not set.`);
    }

    return modelAdapter.nodesData[nodeId] as T;
  }

  /**
   * Set some custom data to a node. If the node had already a value it is
   * erased.
   *
   * Setting node data will trigger an update.
   *
   * If the modelAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
   */
  setNodeData(nodeId: number, data: unknown): void {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`ModelTree.setNodeData [set]: ModelAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`ModelTree.setNodeData [set]: Tree element is not set.`);
    }

    modelAdapter.nodesData[nodeId] = data;
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
   * If the modelAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
   */
  updateNodeData(nodeId: number, data: unknown): void {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`ModelTree.setNodeData [set]: ModelAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`ModelTree.setNodeData [set]: Tree element is not set.`);
    }

    if (Array.isArray(data) && Array.isArray(modelAdapter.nodesData[nodeId])) {
      modelAdapter.nodesData[nodeId] = [...(modelAdapter.nodesData[nodeId] as any[]), ...data];
    } else if (
      typeof data === 'object' &&
      (!modelAdapter.nodesData[nodeId] || typeof modelAdapter.nodesData[nodeId] === 'object')
    ) {
      modelAdapter.nodesData[nodeId] = Object.assign(modelAdapter.nodesData[nodeId] ?? {}, data);
    } else {
      modelAdapter.nodesData[nodeId] = data;
    }

    modelAdapter.nodesData[nodeId] = Object.assign(modelAdapter.nodesData[nodeId] ?? {}, data);
    treeElm.tree = { ...treeElm.tree };
  }

  /**
   * Trigger a refresh of the data for a given node.
   * Usefull if data provided by the model has changed (child nodes added or removed).
   * If node is not loaded, it does nothing since data will be properly loaded when expanded.
   *
   * @public
   * @param {number} nodeId The id of the node to update
   */
  public refreshNodeData(nodeId: number) {
    this.treeRef.value?.refreshNodeData(nodeId);
  }

  /**
   * Notify the tree a node has been removed from the model.
   * This will remove the node and all its children from the tree.
   * If the node is not loaded yet, it does nothing.
   *
   * @public
   * @param {number} nodeId The id of the removed node
   */
  public removeNode(nodeId: number) {
    this.treeRef.value?.removeNode(nodeId);
  }

  private resetTree() {
    this.treeRef.value?.resetTree();

    const model = this.model;
    if (!model) {
      return;
    }

    // Expand until we reach a node with more than one child or a leaf
    const defaultExpandedPath: number[] = [];
    let currentNode = model.getAbsoluteRootNode();
    let children = model.getNodeChildren(currentNode);
    let shouldContinueToDig = model.getNodeChildren(currentNode).length === 1;

    while (shouldContinueToDig) {
      defaultExpandedPath.push(currentNode);
      children = model.getNodeChildren(currentNode);
      shouldContinueToDig = children.length === 1;
      if (shouldContinueToDig) {
        currentNode = children[0];
      }
    }

    if (children.length > 1) {
      defaultExpandedPath.push(currentNode);
    }

    this.treeRef.value?.expandPath(defaultExpandedPath);
  }

  private handleNodeClick(
    event: CustomEventMap['hoops-tree-node-click'] | CustomEventMap['hoops-tree-node-aux-click'],
  ): void {
    event.stopPropagation();
    const { key, ...detail } = event.detail;
    this.dispatchEvent(
      new CustomEvent('hoops-model-tree-node-click', {
        bubbles: true,
        composed: true,
        detail: {
          nodeId: key,
          ...detail,
        },
      }),
    );
  }

  protected override render(): unknown {
    return html`<hoops-tree
      data-html2canvas-ignore
      class="modeltree"
      .tree=${{ context: new ModelAdapter() } as ContextWrapper}
      @hoops-tree-node-click=${(event: CustomEventMap['hoops-tree-node-click']) => {
        this.handleNodeClick(event);
      }}
      @hoops-tree-node-aux-click=${(event: CustomEventMap['hoops-tree-node-aux-click']) => {
        this.handleNodeClick(event);
      }}
      ${ref(this.treeRef)}
    ></hoops-tree>`;
  }
}

export default HoopsModelTreeElement;
