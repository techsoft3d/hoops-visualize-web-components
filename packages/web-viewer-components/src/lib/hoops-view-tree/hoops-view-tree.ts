import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';

import { ViewAdapter, ViewTreeNodeId } from './ViewAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { Tree, ContextWrapper, type TreeNodeClickEvent } from '@ts3d-hoops/ui-kit/tree';

export type * from './custom-events.d.ts';

/**
 * Provides a tree view for displaying and managing saved views and view configurations.
 *
 * This component displays a hierarchical tree of saved views including standard views,
 * annotation views, and combined state views. It supports lazy loading for better
 * performance with large view sets and provides selection and navigation capabilities.
 *
 * @element hoops-view-tree
 *
 * @fires hoops-view-tree-node-click - Emitted when a view node is clicked
 *
 * @example
 * ```html
 * <hoops-view-tree></hoops-view-tree>
 *
 * <script>
 *   document.getElementsByTagName('hoops-view-tree')[0].model = modelInstance;
 *   document.getElementsByTagName('hoops-view-tree')[0].addEventListener('hoops-view-tree-node-click', (event) => {
 *     console.log('View clicked:', event.detail);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
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
   * Reference to the internal tree component element.
   * @internal
   */
  private treeRef = createRef<Tree>();

  /**
   * Gets the internal tree component element.
   * Provides access to the underlying tree functionality.
   * @returns {Tree | undefined} The tree element instance or undefined if not initialized
   */
  get treeElement(): Tree | undefined {
    return this.treeRef.value;
  }

  /**
   * Gets the currently selected view nodes.
   * @returns {number[]} Array of selected node IDs
   */
  get selected(): number[] {
    return this.treeElement?.selected ?? [];
  }

  /**
   * Sets the currently selected view nodes.
   * @param value - Array of node IDs to select
   * @returns {void}
   * @throws {Error} When setting selected nodes before tree initialization
   */
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
   * @return {(IModel | undefined)} The current model instance or undefined
   */
  get model(): IModel | undefined {
    return this.viewAdapter?.model;
  }

  /**
   * Sets the model instance for view data.
   * Setting a new model will refresh the tree view.
   * @param model - The model instance to set
   * @returns {void}
   * @throws {Error} When setting model before view adapter initialization
   */
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
   * Gets the view adapter that manages tree data and operations.
   * @returns {ViewAdapter | undefined} The current view adapter or undefined
   */
  public get viewAdapter(): ViewAdapter | undefined {
    return this.treeElement?.tree.context as ViewAdapter | undefined;
  }

  /**
   * Sets the view adapter that manages tree data and operations.
   * The adapter handles communication between the tree component and the model.
   * @param value - The view adapter to set
   * @returns {void}
   * @throws {Error} When setting adapter before tree initialization
   */
  public set viewAdapter(value: ViewAdapter) {
    if (!this.treeElement) {
      throw new Error(`HoopsViewTree.viewAdapter [set]: Tree element is not set.`);
    }

    this.treeElement.tree = { context: value };
  }

  /**
   * Selects or deselects view nodes in the tree.
   * @param nodeIds - Array of node IDs to select or deselect
   * @param selected - Whether to select (true) or deselect (false) the nodes
   * @returns {void}
   * @throws {Error} When tree element is not initialized
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
   * Retrieves custom data associated with a view node.
   * @param nodeId - The ID of the node to get data from
   * @returns {T} The custom data stored for the node
   * @throws {Error} When view adapter is not initialized
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const viewAdapter = this.viewAdapter;
    if (!viewAdapter) {
      throw new Error(`HoopsViewTree.setNodeData [set]: ViewAdapter is not set.`);
    }

    return viewAdapter.nodesData[nodeId] as T;
  }

  /**
   * Sets custom data for a view node, replacing any existing data.
   * @param nodeId - The ID of the node to store data for
   * @param data - The data to store with the node
   * @returns {void}
   * @throws {Error} When view adapter or tree element is not initialized
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
   * Merges custom data into a view node's existing data.
   * Arrays are concatenated, objects are merged, other types replace existing data.
   * @param nodeId - The ID of the node to update data for
   * @param data - The data to merge with existing node data
   * @returns {void}
   * @throws {Error} When view adapter or tree element is not initialized
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

  /**
   * Resets the tree to its initial state and expands the root node.
   * @internal
   * @returns {void}
   */
  private resetTree() {
    this.treeRef.value?.resetTree();
    this.treeRef.value?.expandPath([ViewTreeNodeId.RootNode]);
  }

  /**
   * Renders the view tree component template.
   * @internal
   * @returns {TemplateResult} The component's HTML template
   */
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
