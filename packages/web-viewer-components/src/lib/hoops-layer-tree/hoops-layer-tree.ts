import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';
import { BaseMouseEvent, List, ContextWrapper } from '@ts3d-hoops/ui-kit/list';

import LayerAdapter, { getAdjustedNodeId } from './LayerAdapter';
import { ILayersContainer } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import {
  LayerClicked,
  LayerNodeVisibilityClickEvent,
  LayerTreeNodeClicked,
  LayerVisibilityClickEvent,
} from './custom-events';
import { LayerTreeElement } from './hoops-layer-tree-element';

export type * from './custom-events.d.ts';

/**
 * Provides a tree view for displaying and managing model layers.
 *
 * This component renders a list of layers with lazy loading support.
 * It handles layer selection, visibility toggling, and node management within layers.
 *
 * @element hoops-layer-tree
 *
 * @fires hoops-layer-tree-node-selected - Emitted when layer nodes are selected
 * @fires hoops-layer-tree-visibility-changed - Emitted when layer visibility changes
 *
 * @example
 * ```html
 * <hoops-layer-tree></hoops-layer-tree>
 *
 * <script>
 *   const layerTree = document.getElementsByTagName('hoops-layer-tree')[0];
 *   layerTree.layersContainer = webviewer.model;
 *   layerTree.addEventListener('hoops-layer-tree-node-selected', (event) => {
 *     console.log('Selected nodes:', event.detail.nodeIds);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-layer-tree')
export class HoopsLayerTreeElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      .layertree {
        height: 100%;
        overflow: auto;
        width: 100%;
      }

      hoops-layer-tree-element {
        width: 100%;
      }
    `,
  ];

  /**
   * Reference to the internal list component element.
   * @internal
   */
  private listRef = createRef<List>();

  /**
   * Gets the internal list component instance.
   *
   * This is a syntactic sugar to simplify getting the list element and expose it externally.
   *
   * @returns {List | undefined} The list element instance or undefined if not initialized
   */
  get layerTreeDomElement(): List | undefined {
    return this.listRef.value;
  }

  /**
   * Gets or sets the layers container that represents the available layers in the model.
   *
   * This is a syntactic sugar to access LayerTree.layerAdapter.layersContainer.
   * If the LayerAdapter is not set it returns undefined.
   *
   * Reassigning the layersContainer will trigger an update.
   *
   * @throws {Error} When setting layersContainer without an initialized layer adapter. This should not happen in normal use since the layerAdapter is added to the layer list at initialization.
   */
  get layersContainer(): ILayersContainer | undefined {
    return this.layerAdapter?.layersContainer;
  }

  set layersContainer(layersContainer: ILayersContainer | undefined) {
    const layerAdapter = this.layerAdapter;
    if (!layerAdapter) {
      throw new Error(`LayerTree.layersContainer [set]: LayerAdapter is not set.`);
    }

    layerAdapter.layersContainer = layersContainer;
    this.layerAdapter = layerAdapter;
  }

  /**
   * Gets or sets the layer adapter that supplies data to the list.
   *
   * This is a syntactic sugar to access list.context.
   * If the List is not set it returns undefined.
   *
   * Reassigning the layerAdapter will trigger an update.
   *
   * @throws {Error} When setting layerAdapater without an initialized list element. This should not happen in normal use since the list is added to the layer list at initialization.
   */
  public get layerAdapter(): LayerAdapter | undefined {
    return this.layerTreeDomElement?.list.context as LayerAdapter | undefined;
  }

  public set layerAdapter(newLayerAdapter: LayerAdapter) {
    if (!this.layerTreeDomElement) {
      throw new Error(`LayerTree.layerAdapter [set]: List element is not set.`);
    }
    const rawLayersData = newLayerAdapter.layersContainer?.getLayers();

    rawLayersData?.forEach((layerName, _layerId) => {
      const newNodes =
        newLayerAdapter.layersContainer?.getNodesFromLayerName(layerName) ?? new Set<number>();
      if (newLayerAdapter.layerNamesToNodeIds.has(layerName)) {
        const existingNodes =
          newLayerAdapter.layerNamesToNodeIds.get(layerName) ?? new Set<number>();
        newLayerAdapter.layerNamesToNodeIds.set(
          layerName,
          new Set<number>([...existingNodes, ...newNodes]),
        );
      } else {
        newLayerAdapter.layerNamesToNodeIds.set(layerName, new Set<number>([...newNodes]));
      }
    });
    const htmlIdsToLayerNames = new Map<number, string>();
    let counter = 0;
    newLayerAdapter.layerNamesToNodeIds.forEach((_v, layerName) => {
      htmlIdsToLayerNames.set(counter++, layerName);
    });

    this.layerTreeDomElement.list = { context: newLayerAdapter };
    this.layerTreeDomElement.list.context.elementsData = htmlIdsToLayerNames;
    this.layerTreeDomElement.list.context.sortedByValue = false;
  }

  /**
   * Selects or deselects layers in the list.
   *
   * Reassigning the selected layers will trigger an update.
   *
   * @param layerIds - Array of layer IDs to update
   * @param selected - Whether to select (true) or deselect (false) the layers
   * @returns {void}
   * @throws {Error} When the layer tree element is not initialized
   */
  selectElements(layerIds: number[], selected: boolean): void {
    if (!this.layerTreeDomElement) {
      throw new Error(`LayerTree.selectElements: layer tree element is not set.`);
    }

    let selection = this.layerTreeDomElement.selected;
    if (!selected) {
      selection = selection.filter((current) => !layerIds.includes(current));
    } else {
      selection = layerIds;
    }

    this.layerTreeDomElement.selected = selection;
  }

  /**
   * Selects or deselects nodes in the layer sublists.
   *
   * Clears existing selection and applies the new selection to all layer tree elements.
   *
   * @param nodeIds - Array of node IDs to update
   * @param selected - Whether to select (true) or deselect (false) the nodes
   * @returns {void}
   * @throws {Error} When the tree dom element is not initialized
   */
  selectNodes(nodeIds: number[], selected: boolean): void {
    if (!this.layerTreeDomElement) {
      throw new Error(`LayerTree.selectElements: tree dom element is not set.`);
    }
    const layerTreeElements = this.getLayerTreeElements();
    layerTreeElements.forEach((el) => {
      el.clearSelection();
      el.selectNodes(nodeIds, selected);
    });
  }

  /**
   * Retrieves custom data associated with a layer.
   *
   * This is a shorthand to allow users to attach reactive data to layers.
   *
   * @param layerId - The ID of the layer that owns the data
   * @returns {T} The stored custom data or undefined if no data exists
   * @throws {Error} When the layer adapter is not initialized
   */
  getElementData<T = unknown>(layerId: number): T {
    const layerAdapter = this.layerAdapter;
    if (!layerAdapter) {
      throw new Error(`LayerTree.setLayerData [set]: LayerAdapter is not set.`);
    }
    return layerAdapter.layersData[layerId] as T;
  }

  /**
   * Stores custom data for a layer, replacing any existing value.
   *
   * If the layer had already a value it is erased.
   * Setting layer data will trigger an update.
   *
   * @param layerId - The ID of the layer that owns the data
   * @param data - The data to store
   * @returns {void}
   * @throws {Error} When the layer adapter or tree element is not initialized
   */
  setLayerData(layerId: number, data: unknown): void {
    const layerAdapter = this.layerAdapter;
    if (!layerAdapter) {
      throw new Error(`LayerTree.setLayerData [set]: LayerAdapter is not set.`);
    }

    const layerTreeElm = this.layerTreeDomElement;
    if (!layerTreeElm) {
      throw new Error(`LayerTree.setLayerData [set]: tree element is not set.`);
    }

    layerAdapter.layersData[layerId] = data;
    layerTreeElm.list = { ...layerTreeElm.list };
  }

  /**
   * Merges custom data into an existing layer entry.
   *
   * If the layer did not have data, it is added to the context.
   * If the given data is an array and the context layer data is an array, the data passed as argument are appended to the context data.
   * If both are objects, then the objects are merged using Object.assign, with the data argument being the last object of the merge.
   * Otherwise it is equivalent to setLayerData.
   *
   * Updating layer data will trigger an update.
   *
   * @param layerId - The ID of the layer that owns the data
   * @param data - The data to merge into the layer entry
   * @returns {void}
   * @throws {Error} When the layer adapter or tree element is not initialized
   */
  updateLayerData(layerId: number, data: unknown): void {
    const layerAdapter = this.layerAdapter;
    if (!layerAdapter) {
      throw new Error(`LayerTree.setLayerData [set]: LayerAdapter is not set.`);
    }

    const layerTreeElm = this.layerTreeDomElement;
    if (!layerTreeElm) {
      throw new Error(`LayerTree.setLayerData [set]: Tree element is not set.`);
    }

    if (Array.isArray(data) && Array.isArray(layerAdapter.layersData[layerId])) {
      layerAdapter.layersData[layerId] = [...(layerAdapter.layersData[layerId] as any[]), ...data];
    } else if (
      typeof data === 'object' &&
      (!layerAdapter.layersData[layerId] || typeof layerAdapter.layersData[layerId] === 'object')
    ) {
      layerAdapter.layersData[layerId] = Object.assign(
        layerAdapter.layersData[layerId] ?? {},
        data,
      );
    } else {
      layerAdapter.layersData[layerId] = data;
    }

    layerAdapter.layersData[layerId] = Object.assign(layerAdapter.layersData[layerId] ?? {}, data);
    layerTreeElm.list = { ...layerTreeElm.list };
  }

  /**
   * Updates visibility icons for layers based on shown and hidden body IDs.
   *
   * This method propagates visibility changes to affected layer tree elements.
   *
   * @param shownBodyIds - Array of body IDs that are now visible
   * @param hiddenBodyIds - Array of body IDs that are now hidden
   * @returns {void}
   */
  updateVisibility(shownBodyIds: number[], hiddenBodyIds: number[]) {
    if (!this.layerAdapter || !this.layerAdapter.layersContainer) {
      console.error(
        'Cannot update layer tree visibility icons: LayerAdapter and/or LayersContainer is not set.',
      );
      return;
    }

    const layerTreeElements = this.getLayerTreeElements();
    const getParentShownBodyId = (nodeId: number) =>
      this.layerAdapter?.layersContainer
        ? getAdjustedNodeId(this.layerAdapter.layersContainer, nodeId)
        : nodeId;
    const parentShownBodyIds = new Set(shownBodyIds.map(getParentShownBodyId));
    const parentHiddenBodyIds = new Set(hiddenBodyIds.map(getParentShownBodyId));

    layerTreeElements.forEach((lle) => {
      const affectedKeys = Array.from(lle.layerNodes.keys()).some(
        (nodeId) => parentShownBodyIds.has(nodeId) || parentHiddenBodyIds.has(nodeId),
      );

      if (affectedKeys) {
        lle.updateVisibility(
          Array.from(parentShownBodyIds).filter((id) => lle.layerNodes.has(id)),
          Array.from(parentHiddenBodyIds).filter((id) => lle.layerNodes.has(id))
        );
      }
    });
  }

  /**
   * Renders the layer tree component template.
   * @internal
   * @returns {unknown} The Lit HTML template
   */
  protected override render(): unknown {
    return html`<hoops-list
      class="layertree"
      .list=${{ context: new LayerAdapter() } as ContextWrapper}
      ${ref(this.listRef)}
      @hoops-layer-clicked=${this.onLayerClicked}
      @hoops-layer-tree-node-clicked=${this.onLayerNodeClicked}
      @hoops-layer-visibility-change=${this.onLayerVisibilityClicked}
      @hoops-layer-node-visibility-change=${this.onLayerNodeVisibilityClicked}
    ></hoops-list>`;
  }

  /**
   * Handles layer click events and manages layer selection.
   * @internal
   * @param event - The layer clicked event
   * @returns {void}
   */
  private onLayerClicked(event: LayerClicked) {
    const layerElement = event.detail.source as LayerTreeElement;
    if (event.detail.button === 0 || (event.detail.button === 2 && !layerElement.selected)) {
      layerElement.toggleSelection();
    }
    // Deselect other layers
    const otherElements = this.getLayerTreeElements();
    otherElements?.forEach((lle) => {
      if (lle.layerId === event.detail.layerId) {
        return;
      }
      lle.select(false);
    });
    this.notifyNodeSelection(event.detail);
  }

  /**
   * Retrieves all layer tree element instances from the shadow DOM.
   * @internal
   * @returns {LayerTreeElement[]} Array of layer tree elements
   */
  private getLayerTreeElements(): LayerTreeElement[] {
    const ll = this.shadowRoot?.querySelector('.layertree');
    const dl = ll?.shadowRoot?.querySelector('div.list');
    const listElements = dl?.querySelectorAll('hoops-list-element');
    const LayerTreeElements = new Array<LayerTreeElement>();
    listElements?.forEach((listElement) => {
      const lle = listElement.shadowRoot?.querySelector(
        'div.element > div.header > hoops-layer-tree-element',
      ) as LayerTreeElement;
      if (lle) {
        LayerTreeElements.push(lle);
      }
    });
    return LayerTreeElements;
  }

  /**
   * Handles layer node click events and manages node selection.
   * @internal
   * @param event - The layer tree node clicked event
   * @returns {void}
   */
  private onLayerNodeClicked(event: LayerTreeNodeClicked) {
    const layerElement = event.detail.source as LayerTreeElement;
    if (
      event.detail.button === 0 ||
      (event.detail.button === 2 && !layerElement.selectedNodes.includes(event.detail.nodeId))
    ) {
      layerElement.toggleNodeSelection(event.detail.nodeId);
    }
    let wasSelected = false;
    if (layerElement.selectedNodes.includes(event.detail.nodeId)) {
      wasSelected = true;
    }
    // Clear other selections
    const layerSublists = this.getLayerTreeElements();
    layerSublists?.forEach((lle) => {
      lle.selectedNodes = [];
    });
    if (wasSelected) {
      layerElement.selectedNodes.push(event.detail.nodeId);
    }
    this.notifyNodeSelection(event.detail);
  }

  /**
   * Handles layer visibility toggle events.
   * @internal
   * @param event - The layer visibility click event
   * @returns {void}
   */
  private onLayerVisibilityClicked(event: LayerVisibilityClickEvent) {
    const layerElement = event.detail.source as LayerTreeElement;
    layerElement.toggleVisibility();
    this.notifyLayerVisibility(event.detail);
  }

  /**
   * Handles layer node visibility toggle events.
   * @internal
   * @param event - The layer node visibility click event
   * @returns {void}
   */
  private onLayerNodeVisibilityClicked(event: LayerNodeVisibilityClickEvent) {
    this.notifyLayerVisibility(event.detail);
  }

  /**
   * Dispatches a custom event to notify about node selection changes.
   * @internal
   * @param event - The base mouse event details
   * @returns {void}
   */
  private notifyNodeSelection(event: BaseMouseEvent) {
    const selectedIds: number[] = [];
    const layerSublists = this.getLayerTreeElements();
    layerSublists?.forEach((lle) => {
      selectedIds.push(...lle.selectedNodes);
    });
    this.dispatchEvent(
      new CustomEvent<{ nodeIds: number[]; source: HTMLElement } & BaseMouseEvent>(
        'hoops-layer-tree-node-selected',
        {
          bubbles: true,
          composed: true,
          detail: {
            ...event,
            nodeIds: selectedIds,
            source: this,
          },
        },
      ),
    );
  }

  /**
   * Dispatches a custom event to notify about layer visibility changes.
   * @internal
   * @param event - The base mouse event details
   * @returns {void}
   */
  private notifyLayerVisibility(event: BaseMouseEvent) {
    const hiddenLayers = this.getLayerTreeElements();
    const hiddenNodeIds: number[] = [];
    hiddenLayers.forEach((lle) => {
      hiddenNodeIds.push(...lle.hiddenNodes);
    });
    this.dispatchEvent(
      new CustomEvent<{ nodeIds: number[]; source: HTMLElement } & BaseMouseEvent>(
        'hoops-layer-tree-visibility-changed',
        {
          bubbles: true,
          composed: true,
          detail: {
            ...event,
            nodeIds: hiddenNodeIds,
            source: this,
          },
        },
      ),
    );
  }
}

export default HoopsLayerTreeElement;
