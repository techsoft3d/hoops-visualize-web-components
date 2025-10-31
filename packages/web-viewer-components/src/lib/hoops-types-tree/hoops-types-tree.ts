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
 * This class implements the types tree web component. It has no property but it
 * has some members and methods. In order to set the model you can assign it to
 * HoopsTypesTree.model and it will update automatically.
 *
 * It mainly relies on TypeAdapter and hoops-tree.
 * Thanks to hoops-tree, the nodes in the tree are lazy loaded, expansion and
 * selection are handle.
 *
 * Lazy loading allows better performance and memory consumption especially at
 * loading.
 *
 * @export
 * @class HoopsTypesTree
 * @typedef {HoopsTypesTree}
 * @extends {LitElement}
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
   * A reference to the `hoops-tree` element
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
   * types tree at initialization.
   *
   * @type {number[]}
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
   * The IModel interface that represents the Model.
   *
   * This is a syntactic sugar to access HoopsTypesTree.typeAdapter.model.
   * If the TypeAdapter is not set it returns an undefined.
   *
   * Reassigning the model will trigger an update.
   *
   * Trying to set the model while the typeAdapter is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the typeAdapter is added
   * to the types tree at initialization.
   *
   * @type {(IModel | undefined)}
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
   * Get/Set the TypesTreeAdapter
   *
   * This is a syntactic sugar to access tree.context
   * If the Tree is not set it returns undefined.
   *
   * Reassigning the typesTreeAdapter will trigger an update.
   *
   * Trying to set the typesTreeAdapter while the tree is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the tree is added to the
   * types tree at initialization.
   *
   * @public
   * @type {(TypesTreeAdapter | undefined)}
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
   * Select a node in the Tree.
   *
   * @param {number[]} nodeIds The ids of the nodes to select
   * @param {boolean} selected Either to select or deselect the node
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
   * In order to allow user to attach reactive data to the nodes this is a
   * shorthand to get the custom data for a node given its id.
   *
   * If the typeAdapter does not exist it will throw an Error.
   * Otherwise it will return the data if any or your node.
   *
   * @param {number} nodeId The id of the node that owns the data.
   * @returns {unknown} The data stored by the user.
   */
  getNodeData<T = unknown>(nodeId: number): T {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.setNodeData [set]: TypesTreeAdapter is not set.`);
    }

    return typesTreeAdapter.nodesData[nodeId] as T;
  }

  /**
   * Set some custom data to a node. If the node had already a value it is
   * erased.
   *
   * Setting node data will trigger an update.
   *
   * If the typeAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
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
   * If the typeAdapter does not exist it will throw an Error.
   *
   * If the treeElm does not exist it will throw an Error.
   *
   * @param {number} nodeId The id of the node that owns the data;
   * @param {unknown} data The data to store.
   */
  updateNodeData(nodeId: number, data: unknown): void {
    const typesTreeAdapter = this.typesTreeAdapter;
    if (!typesTreeAdapter) {
      throw new Error(`HoopsTypesTree.setNodeData [set]: TypesTreeAdapter is not set.`);
    }

    const treeElm = this.treeElement;
    if (!treeElm) {
      throw new Error(`HoopsTypesTree.setNodeData [set]: Tree element is not set.`);
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
   * Update the visibility state of nodes in the tree.
   * Sets the 'visible' property in nodesData for each nodeId in the provided arrays.
   * @param shownBodyIds Array of node IDs to mark as visible
   * @param hiddenBodyIds Array of node IDs to mark as hidden
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

  private resetTree() {
    this.treeRef.value?.resetTree();
    this.treeRef.value?.expandPath([TypesTreeNodeId.RootNode]);
  }

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
