import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { Tree, ContextWrapper } from '@ts3d-hoops/ui-kit/tree';

import ModelAdapter from './ModelAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

export type * from './custom-events.d.ts';

/**
 * Provides a tree view for displaying and navigating the model structure.
 *
 * This component renders a lazy-loaded tree of model nodes using the model adapter.
 * It supports selection, contextual data storage, and emits events when nodes are interacted with.
 *
 * @element hoops-model-tree
 *
 * @fires hoops-model-tree-node-click - Emitted when a model node is clicked (primary or auxiliary button)
 *
 * @example
 * ```html
 * <hoops-model-tree></hoops-model-tree>
 *
 * <script>
 *   const tree = document.getElementsByTagName('hoops-model-tree')[0];
 *   tree.model = modelInstance;
 *   tree.addEventListener('hoops-model-tree-node-click', (event) => {
 *     console.log('Node clicked:', event.detail.nodeId);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
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
   * Reference to the internal tree component element.
   * @internal
   */
  private treeRef = createRef<Tree>();

  /**
   * Gets the internal tree component instance.
   * Provides access to the underlying tree API when needed.
   * @returns {Tree | undefined} The tree element instance or undefined if not initialized
   */
  get treeElement(): Tree | undefined {
    return this.treeRef.value;
  }

  /**
   * Gets the currently selected model node IDs.
   * @returns {number[]} Array of selected node IDs
   */
  get selected(): number[] {
    return this.treeElement?.selected ?? [];
  }

  /**
   * Sets the currently selected model node IDs.
   * @param value - Array of node IDs to select
   * @returns {void}
   * @throws {Error} When the tree element is not initialized
   */
  set selected(value: number[]) {
    if (!this.treeElement) {
      throw new Error(`ModelTree.selected [set]: Tree element is not set.`);
    }

    this.treeElement.selected = value;
  }

  /**
   * Gets the model instance used to populate the tree.
   * @returns {IModel | undefined} The current model instance or undefined
   */
  get model(): IModel | undefined {
    return this.modelAdapter?.model;
  }

  /**
   * Sets the model instance used to populate the tree.
   * Setting the model refreshes the displayed tree structure.
   * @param model - The model instance to set
   * @returns {void}
   * @throws {Error} When the model adapter is not initialized
   */
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
   * Gets the model adapter that supplies data to the tree.
   * @returns {ModelAdapter | undefined} The current model adapter or undefined
   */
  public get modelAdapter(): ModelAdapter | undefined {
    return this.treeElement?.tree.context as ModelAdapter | undefined;
  }

  /**
   * Sets the model adapter that supplies data to the tree.
   * @param value - The model adapter to set
   * @returns {void}
   * @throws {Error} When the tree element is not initialized
   */
  public set modelAdapter(value: ModelAdapter) {
    if (!this.treeElement) {
      throw new Error(`ModelTree.modelAdapter [set]: Tree element is not set.`);
    }

    this.treeElement.tree = { context: value };
  }

  /**
   * Selects or deselects nodes in the tree.
   *
   * Reassigning the selected nodes will trigger an update.
   *
   * @param nodeIds - Array of node IDs to update
   * @param selected - Whether to select (true) or deselect (false) the nodes
   * @returns {void}
   * @throws {Error} When the tree element is not initialized
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
   * Retrieves custom data associated with a node.
   *
   * This is a shorthand to allow users to attach reactive data to nodes.
   *
   * @param nodeId - The ID of the node that owns the data
   * @returns {T} The stored custom data
   * @throws {Error} When the model adapter is not initialized
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`ModelTree.setNodeData [set]: ModelAdapter is not set.`);
    }

    return modelAdapter.nodesData[nodeId] as T;
  }

  /**
   * Stores custom data for a node, replacing any existing value.
   *
   * If the node had already a value it is erased.
   * Setting node data will trigger an update.
   *
   * @param nodeId - The ID of the node that owns the data
   * @param data - The data to store
   * @returns {void}
   * @throws {Error} When the model adapter or tree element is not initialized
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
   * Merges custom data into an existing node entry.
   *
   * If the node did not have data, it is added to the context.
   * If the given data is an array and the context node data is an array, the data passed as argument are appended to the context data.
   * If both are objects, then the objects are merged using Object.assign, with the data argument being the last object of the merge.
   * Otherwise it is equivalent to setNodeData.
   *
   * Updating node data will trigger an update.
   *
   * @param nodeId - The ID of the node that owns the data
   * @param data - The data to merge into the node entry
   * @returns {void}
   * @throws {Error} When the model adapter or tree element is not initialized
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
   * Refreshes the data for a specific node.
   *
   * Useful if data provided by the model has changed (child nodes added or removed).
   * If node is not loaded, it does nothing since data will be properly loaded when expanded.
   *
   * @param nodeId - The ID of the node to refresh
   * @returns {void}
   */
  public refreshNodeData(nodeId: number) {
    this.treeRef.value?.refreshNodeData(nodeId);
  }

  /**
   * Removes a node and its descendants from the displayed tree.
   *
   * This notifies the tree that a node has been removed from the model.
   * If the node is not loaded yet, it does nothing.
   *
   * @param nodeId - The ID of the removed node
   * @returns {void}
   */
  public removeNode(nodeId: number) {
    this.treeRef.value?.removeNode(nodeId);
  }

  /**
   * Resets the tree and expands default nodes for user visibility.
   * @internal
   * @returns {void}
   */
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

  /**
   * Handles low-level tree click events and re-emits them as model tree events.
   * @internal
   * @param event - The original tree click event
   * @returns {void}
   */
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

  /**
   * Renders the tree component template.
   * @internal
   * @returns {unknown} The Lit HTML template
   */
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
