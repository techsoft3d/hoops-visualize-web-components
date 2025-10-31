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
 * This class implements the layer list web component. It has no property but it
 * has some members and methods. In order to set the layer you can assign it to
 * LayerTree.layer and it will update automatically.
 *
 * It mainly relies on LayerAdapter and hoops-list.
 * Thanks to hoops-list, the layers in the list are lazy loaded, expansion and
 * selection are handle.
 *
 * Lazy loading allows better performance and memory consumption especially at
 * loading.
 *
 * @export
 * @class LayerTree
 * @typedef {LayerTree}
 * @extends {LitElement}
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
   * A reference to the `hoop-list` element
   *
   * @private
   * @type {Ref<List>}
   */
  private listRef = createRef<List>();

  /**
   * Get the List element
   *
   * This is a syntactic sugar to simplify getting the list element and expose
   * it externally
   *
   * @readonly
   * @type {(List | undefined)}
   */
  get layerTreeDomElement(): List | undefined {
    return this.listRef.value;
  }

  /**
   * The ILayersContainer interface that represents the available layers in the model.
   *
   * This is a syntactic sugar to access LayerTree.layerAdapter.layersContainer.
   * If the LayerAdapter is not set it returns an undefined.
   *
   * Reassigning the layersContainer will trigger an update.
   *
   * Trying to set the layersContainer while the layerAdapter is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the layerAdapter is added
   * to the layer list at initialization.
   *
   * @type {(ILayersContainer | undefined)}
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
   * Get/Set the LayerAdapter
   *
   * This is a syntactic sugar to access list.context
   * If the List is not set it returns undefined.
   *
   * Reassigning the layerAdapter will trigger an update.
   *
   * Trying to set the layerAdapter while the list is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the list is added to the
   * layer list at initialization.
   *
   * @public
   * @type {(LayerAdapter | undefined)}
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
   * Select a layer in the List.
   *
   * @param {number[]} layerIds The ids of the layers to select
   * @param {boolean} selected Either to select or deselect the layer
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

  /*
   * Select a node in the layer sublists
   *
   * @param {number[]} nodeIds The ids of the nodes to select
   * @param {boolean} selected Either to select or deselect the node
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
   * In order to allow user to attach reactive data to the layers this is a
   * shorthand to get the custom data for a layer given its id.
   *
   * If the layerAdapter does not exist it will throw an Error.
   * Otherwise it will return the data if any or your layer.
   *
   * @param {number} layerId The id of the layer that owns the data.
   * @returns {unknown} The data stored by the user.
   */
  getElementData<T = unknown>(layerId: number): T {
    const layerAdapter = this.layerAdapter;
    if (!layerAdapter) {
      throw new Error(`LayerTree.setLayerData [set]: LayerAdapter is not set.`);
    }
    return layerAdapter.layersData[layerId] as T;
  }

  /**
   * Set some custom data to a layer. If the layer had already a value it is
   * erased.
   *
   * Setting layer data will trigger an update.
   *
   * If the layerAdapter does not exist it will throw an Error.
   *
   * If the listElm does not exist it will throw an Error.
   *
   * @param {number} layerId The id of the layer that owns the data;
   * @param {unknown} data The data to store.
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
   * Merge some custom data into a layer's data. If the layer did not have data,
   * it is added to the context.
   *
   * If the given data is an array and the context layer data is an array, the
   * data passed as argument are appended to the context data.
   * If both are objects, then the objects are merged using Object.assign, with
   * the data argument being the last object of the merge.
   * Otherwise it is equivalent to setLayerData.
   *
   * Updating layer data will trigger an update.
   *
   * If the layerAdapter does not exist it will throw an Error.
   *
   * If the layerTreeElm does not exist it will throw an Error.
   *
   * @param {number} layerId The id of the layer that owns the data;
   * @param {unknown} data The data to store.
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

  private onLayerVisibilityClicked(event: LayerVisibilityClickEvent) {
    const layerElement = event.detail.source as LayerTreeElement;
    layerElement.toggleVisibility();
    this.notifyLayerVisibility(event.detail);
  }

  private onLayerNodeVisibilityClicked(event: LayerNodeVisibilityClickEvent) {
    this.notifyLayerVisibility(event.detail);
  }

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
