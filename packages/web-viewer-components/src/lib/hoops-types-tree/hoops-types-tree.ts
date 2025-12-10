import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { Tree, ContextWrapper } from '@ts3d-hoops/ui-kit/tree';

import { TypesTreeAdapter, TypesTreeNodeId } from './TypesAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import { TypeTreeNodeElement } from './hoops-types-tree-node';
import { branchVisibilityFromComBranchVisibility } from '../hoops-model-tree/types';

export type * from './custom-events.d.ts';

/**
 * Provides a specialized tree component for displaying model type hierarchies with lazy loading and selection.
 *
 * This component relies on TypesTreeAdapter and hoops-tree for its functionality. The tree nodes are
 * lazy loaded for better performance and memory consumption, especially during initial loading.
 * Expansion and selection are handled automatically by the underlying hoops-tree component.
 *
 * The component has no reactive properties but provides methods and getters/setters to interact with
 * the tree state. To set the model, assign it to the `model` property and it will update automatically.
 *
 * @element hoops-types-tree
 *
 * @fires hoops-types-tree-node-click - Emitted when a tree node is clicked
 * @fires hoops-types-tree-type-node-click - Emitted when a type node is clicked
 * @fires hoops-types-tree-node-visibility-change - Emitted when node visibility changes
 *
 * @example
 * ```html
 * <hoops-types-tree></hoops-types-tree>
 *
 * <script>
 *   document.getElementsByTagName('hoops-types-tree')[0].model = modelInstance;
 *   document.getElementsByTagName('hoops-types-tree')[0].addEventListener('hoops-types-tree-node-click', (event) => {
 *     console.log('Node clicked:', event.detail);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-types-tree')
export class HoopsTypesTreeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      .typestree {
        height: 100%;
        overflow: auto;
      }
    `,
  ];

  /**
   * Reference to the internal hoops-tree element.
   */
  private treeRef = createRef<Tree>();

  /**
   * Gets the underlying Tree element.
   *
   * @returns {Tree | undefined} The tree element instance or undefined if not available
   */
  get treeElement(): Tree | undefined {
    return this.treeRef.value;
  }

  /**
   * Gets or sets the selected nodes in the tree.
   *
   * This is a syntactic sugar to access the underlying Tree's selected property.
   * If the Tree element is not set, getter returns an empty array.
   * Reassigning the selected array will trigger a reactive update.
   *
   * Note: Trying to set selected nodes while the tree element is not available will throw an error.
   * This should not happen in normal use cases since the tree is added at initialization.
   *
   * @returns {number[]} Array of selected node IDs
   * @defaultValue []
   * @throws Error - Thrown when attempting to set while tree element is not available
   */
  get selected(): number[] {
    return this.treeElement?.selected ?? [];
  }

  set selected(value: number[]) {
    if (!this.treeElement) {
      throw new Error(`HoopsTypesTree.selected [set]: Tree element is not set.`);
    }

    this.treeElement.selected = value;
  }

  /**
   * Gets or sets the IModel interface that represents the Model being displayed.
   *
   * This is syntactic sugar to access the TypesTreeAdapter's model property.
   * If the TypesTreeAdapter is not set, getter returns undefined.
   * Reassigning the model will trigger a tree reset and update automatically.
   *
   * Note: Trying to set the model while the TypesTreeAdapter is not available will throw an error.
   * This should not happen in normal use cases since the TypesTreeAdapter is added at initialization.
   *
   * @returns {IModel | undefined} The model instance or undefined if not available
   * @throws Error - Thrown when attempting to set while TypesTreeAdapter is not available
   */
  get model(): IModel | undefined {
    return this.typesTreeAdapter?.model;
  }

  set model(model: IModel | undefined) {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.model [set]: TypesTreeAdapter is not set.`);
    }

    typesTreeAdapter.model = model;
    this.typesTreeAdapter = typesTreeAdapter;
    this.resetTree();
  }

  /**
   * Gets or sets the TypesTreeAdapter that manages tree data and operations.
   *
   * This provides syntactic sugar to access the underlying tree's context adapter.
   * If the Tree element is not set, getter returns undefined.
   * Reassigning the TypesTreeAdapter will trigger a reactive update.
   *
   * Note: Trying to set the TypesTreeAdapter while the tree element is not available will throw an error.
   * This should not happen in normal use cases since the tree is added at initialization.
   *
   * @returns {TypesTreeAdapter | undefined} The TypesTreeAdapter instance or undefined if not available
   * @throws Error - Thrown when attempting to set while tree element is not available
   */
  public get typesTreeAdapter(): TypesTreeAdapter | undefined {
    return this.treeElement?.tree.context as TypesTreeAdapter | undefined;
  }

  public set typesTreeAdapter(value: TypesTreeAdapter) {
    if (!this.treeElement) {
      throw new Error(`HoopsTypesTree.typesTreeAdapter [set]: Tree element is not set.`);
    }

    this.treeElement.tree = { context: value };
  }

  /**
   * Selects or deselects nodes in the tree.
   *
   * @param nodeIds - Array of node IDs to select or deselect
   * @param selected - Whether to select (true) or deselect (false) the nodes
   * @returns {void}
   * @throws Error - Thrown when tree element is not available
   */
  selectNodes(nodeIds: number[], selected: boolean): void {
    if (!this.treeElement) {
      throw new Error(`HoopsTypesTree.selectNodes: Tree element is not set.`);
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
   * Retrieves custom data attached to a specific node.
   *
   * This allows users to attach reactive data to tree nodes. If the TypesTreeAdapter
   * does not exist, it will throw an Error. Otherwise it will return the stored data
   * for the specified node, if any.
   *
   * @param nodeId - The ID of the node to get data for
   * @returns {T} The custom data stored for the node
   * @throws Error - Thrown when TypesTreeAdapter is not available
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.getNodeData: TypesTreeAdapter is not set.`);
    }

    return typesTreeAdapter.nodesData[nodeId] as T;
  }

  /**
   * Sets custom data for a specific node, replacing any existing data.
   *
   * If the node already has a value, it will be erased and replaced with the new data.
   * Setting node data will trigger a reactive update of the tree component.
   *
   * @param nodeId - The ID of the node to set data for
   * @param data - The data to store for the node
   * @returns {void}
   * @throws Error - Thrown when TypesTreeAdapter or tree element is not available
   */
  setNodeData(nodeId: number, data: unknown): void {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.setNodeData [set]: TypesTreeAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`HoopsTypesTree.setNodeData [set]: Tree element is not set.`);
    }

    typesTreeAdapter.nodesData[nodeId] = data;
    treeElm.tree = { ...treeElm.tree };
  }

  /**
   * Merges custom data into a node's existing data instead of replacing it.
   *
   * If the node does not have existing data, the new data is added to the context.
   * The merge behavior depends on data types:
   * - If both existing and new data are arrays: new data is appended to the existing array
   * - If both are objects: objects are merged using Object.assign, with new data taking precedence
   * - Otherwise: equivalent to calling setNodeData (replaces existing data)
   *
   * Updating node data will trigger a reactive update of the tree component.
   *
   * @param nodeId - The ID of the node to update data for
   * @param data - The data to merge with existing node data
   * @returns {void}
   * @throws Error - Thrown when TypesTreeAdapter or tree element is not available
   */
  updateNodeData(nodeId: number, data: unknown): void {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.updateNodeData: TypesTreeAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`HoopsTypesTree.updateNodeData: Tree element is not set.`);
    }

    if (Array.isArray(data) && Array.isArray(typesTreeAdapter.nodesData[nodeId])) {
      typesTreeAdapter.nodesData[nodeId] = [
        ...(typesTreeAdapter.nodesData[nodeId] as any[]),
        ...data,
      ];
    } else if (
      typeof data === 'object' &&
      (!typesTreeAdapter.nodesData[nodeId] ||
        typeof typesTreeAdapter.nodesData[nodeId] === 'object')
    ) {
      typesTreeAdapter.nodesData[nodeId] = Object.assign(
        typesTreeAdapter.nodesData[nodeId] ?? {},
        data,
      );
    } else {
      typesTreeAdapter.nodesData[nodeId] = data;
    }

    typesTreeAdapter.nodesData[nodeId] = Object.assign(
      typesTreeAdapter.nodesData[nodeId] ?? {},
      data,
    );
    treeElm.tree = { ...treeElm.tree };
  }

  /**
   * Retrieves all type tree node elements from the shadow DOM.
   *
   * @internal
   * @returns {TypeTreeNodeElement[]} Array of TypeTreeNodeElement instances found in the tree
   */
  private getNodeElements(): TypeTreeNodeElement[] {
    const ll = this.shadowRoot?.querySelector('.typestree');
    const dl = ll?.shadowRoot?.querySelector('div.tree');
    const treeElements = dl?.querySelectorAll('hoops-tree-node');
    const typesTreeNodes = new Array<TypeTreeNodeElement>();
    treeElements?.forEach((treeElement) => {
      const tte = treeElement.shadowRoot?.querySelector(
        'div.node div.header hoops-types-tree-node',
      ) as TypeTreeNodeElement;
      if (tte) {
        typesTreeNodes.push(tte);
      }
    });
    return typesTreeNodes;
  }

  /**
   * Updates the visibility state of all nodes in the tree.
   *
   * This method refreshes the visibility for all node elements by:
   * - For individual model nodes: retrieving visibility from the model's getBranchVisibility method
   * - For type nodes: using stored visibility data from nodesData or defaulting to 'Shown'
   *
   * Note: The parameters are currently unused in the implementation but maintained for API compatibility.
   *
   * @param _shownBodyIds - Array of node IDs to mark as visible (currently unused)
   * @param _hiddenBodyIds - Array of node IDs to mark as hidden (currently unused)
   * @returns {void}
   * @throws Error - Thrown when TypesTreeAdapter is not available
   */
  public updateVisibility(_shownBodyIds: number[], _hiddenBodyIds: number[]): void {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error('HoopsTypesTree.updateVisibility: TypesTreeAdapter is not set.');
    }
    this.getNodeElements().forEach((node) => {
      if (!node.isTypeNode()) {
        // For individual model nodes, get visibility from the model
        const branchVisibility = typesTreeAdapter.model?.getBranchVisibility(node.modelNodeId);
        if (branchVisibility !== undefined) {
          node.visibility = branchVisibilityFromComBranchVisibility(branchVisibility);
        }
      } else {
        // For type nodes, use stored visibility or default to 'Shown'
        const storedData = typesTreeAdapter.nodesData[node.nodeId] as any;
        node.visibility = storedData?.visibility || 'Shown';
      }
    });
  }

  /**
   * Resets the tree to its initial state and expands the root node.
   *
   * @internal
   * @returns {void}
   */
  private resetTree() {
    this.treeRef.value?.resetTree();
    this.treeRef.value?.expandPath([TypesTreeNodeId.RootNode]);
  }

  /**
   * Renders the component template.
   *
   * @returns {unknown} The HTML template for the component
   */
  protected override render(): unknown {
    return html`<hoops-tree
      class="typestree"
      .tree=${{ context: new TypesTreeAdapter() } as ContextWrapper}
      @hoops-types-tree-node-click=${this.handleNodeClick}
      @hoops-types-tree-type-node-click=${this.handleTypeNodeClick}
      @hoops-types-tree-node-visibility-change=${this.handleVisibilityChange}
      ${ref(this.treeRef)}
    ></hoops-tree>`;
  }

  /**
   * Handles node click events and re-emits them with proper event bubbling.
   *
   * @internal
   * @param event - The node click event from child components
   * @returns {void}
   */
  private handleNodeClick = (
    event: CustomEvent<{ nodeId: number; source: HTMLElement } & MouseEvent>,
  ) => {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('hoops-types-tree-node-click', {
        bubbles: true,
        composed: true,
        detail: {
          ...event.detail,
        },
      }),
    );
  };

  /**
   * Handles type node click events and re-emits them with proper event bubbling.
   *
   * @internal
   * @param event - The type node click event from child components
   * @returns {void}
   */
  private handleTypeNodeClick = (
    event: CustomEvent<
      { nodeIds: number[]; source: HTMLElement; isTypeNode: boolean } & MouseEvent
    >,
  ) => {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('hoops-types-tree-type-node-click', {
        bubbles: true,
        composed: true,
        detail: {
          ...event.detail,
        },
      }),
    );
  };

  /**
   * Handles visibility change events and updates node data for type nodes.
   *
   * For type nodes, persists the visibility change in nodesData before re-emitting the event.
   *
   * @internal
   * @param event - The visibility change event from child components
   * @returns {void}
   */
  private handleVisibilityChange = (
    event: CustomEvent<
      {
        nodeIds: number[];
        source: HTMLElement;
        visible: boolean;
        isTypeNode?: boolean;
        treeNodeId?: number;
      } & MouseEvent
    >,
  ) => {
    event.stopPropagation();

    // If this is a type node, update the nodesData to persist the visibility change
    if (event.detail.isTypeNode && event.detail.treeNodeId !== undefined) {
      this.updateNodeData(event.detail.treeNodeId, {
        visibility: event.detail.visible ? 'Shown' : 'Hidden',
      });
    }

    this.dispatchEvent(
      new CustomEvent('hoops-types-tree-node-visibility-change', {
        bubbles: true,
        composed: true,
        detail: {
          ...event.detail,
        },
      }),
    );
  };
}

export default HoopsTypesTreeElement;
