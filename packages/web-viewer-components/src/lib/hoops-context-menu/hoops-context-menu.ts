import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { IContextMenuModel, IContextMenuWebViewer } from './types';
import {
  Color,
  ElementType,
  GenericType,
  LayerName,
  NodeId,
  OperatorId,
  Point3,
} from '@ts3d-hoops/web-viewer';
import { IsolateZoomHelper } from './IsolateZoomHelper';
import { Selection } from '@ts3d-hoops/web-viewer';
import { getService, IExplodeService } from '../services';

@customElement('hoops-context-menu')
class HoopsContextMenuElement extends LitElement {
  @property({ type: Number }) x = 0;
  @property({ type: Number }) y = 0;
  @property({ type: IsolateZoomHelper }) isolateZoomHelper: IsolateZoomHelper | undefined;
  @property({ type: String }) activeItemId: NodeId | null = null;
  @property({ type: String }) activeLayerName: string | null = null;
  @property({ type: String }) activeType: GenericType | null = null;
  @property({ type: Object }) protected position: Point3 | null = null;
  @property({ type: String }) color = '#ff0000';

  @property({ type: Object })
  private model: IContextMenuModel | undefined;

  @property({ type: Object })
  private webViewer: IContextMenuWebViewer | undefined;

  @property({ type: Boolean }) isUnsettingColor = false;

  private explodeService!: IExplodeService;

  static styles = css`
    :host {
      background-color: var(--hoops-neutral-background-20);
      position: fixed;
      z-index: 1000;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3);
      padding: 0.3rem;
    }

    .context-menu-item {
      display: block;
      white-space: nowrap;
      user-select: none;
    }

    .context-menu-item:not(.disabled) {
      cursor: pointer;
    }

    .context-menu-item:not(.disabled):hover {
      color: var(--hoops-accent-foreground-hover);
    }

    .context-menu-item.disabled {
      color: var(--hoops-accent-foreground-disabled);
      cursor: default;
    }

    .color-picker-container {
      display: flex;
      align-items: center;
      width: 100%;
    }

    .color-picker-container > .context-menu-item {
      display: inline-flex;
      justify-content: space-between;
      vertical-align: middle;
      padding-right: 0.3rem;
    }

    input[type='color'] {
      padding: 0;
      height: 1.2rem;
      width: 1.2rem;
      cursor: pointer;
      border-radius: 50%;
      border: none;
      box-shadow: 0 0 0.3rem rgba(0, 0, 0, 0.5);
      margin-left: auto;
    }

    input[type='color']::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    input[type='color']::-webkit-color-swatch {
      border: none;
    }
  `;

  render() {
    const contextualItemClass = this.isMenuItemExecutable()
      ? 'context-menu-item'
      : 'context-menu-item disabled';
    const handleClasses = this.isHandleExecutable()
      ? 'context-menu-item'
      : 'context-menu-item disabled';
    const visibilityContent = this.isMenuItemVisible() ? 'Hide' : 'Show';
    const colorItemContent = this.isUnsettingColor ? 'Unset Color' : 'Set Color';
    return html`
      <div class="context-menu">
        <div class="${contextualItemClass}" @click=${this.isolateFunc}>Isolate</div>
        <div class="${contextualItemClass}" @click=${this.zoomFunc}>Zoom</div>
        <div class="${contextualItemClass}" @click=${this.visibilityFunc}>${visibilityContent}</div>
        <hr />
        <div class="${contextualItemClass}" @click=${this.transparentFunc}>Transparent</div>
        <hr />
        <div class="color-picker-container">
          <div class="${contextualItemClass}" @click=${this.setColorFunc}>${colorItemContent}</div>
          <input
            type="color"
            id="favcolor"
            name="favcolor"
            value="${this.color}"
            @input="${this.handleColorChange}"
          />
        </div>
        <hr />
        <div class="${handleClasses}" @click=${this.handlesFunc}>Show Handles</div>
        <div class="context-menu-item" @click=${this.resetFunc}>Reset Model</div>
        <hr />
        <div class="context-menu-item" @click=${this.showAllFunc}>Show All</div>
        <slot></slot>
      </div>
    `;
  }

  private handleColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.color = input.value;
  }

  updated(_changedProperties: Map<string | number | symbol, unknown>) {
    if (!this.webViewer || !this.model) {
      return;
    }

    this.style.left = `${this.x}px`;
    this.style.top = `${this.y}px`;

    const menu = this.shadowRoot?.querySelector('.context-menu') as HTMLElement;
    if (menu) {
      const rect = menu.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        this.style.left = `${this.x - rect.width}px`;
      } else {
        this.style.left = `${this.x}px`;
      }
      if (rect.bottom > window.innerHeight) {
        this.style.top = `${this.y - rect.height}px`;
      } else {
        this.style.top = `${this.y}px`;
      }
      this.updateIsUnsettingColor();
    } else {
      console.error('menu not found');
    }
  }

  async updateIsUnsettingColor() {
    const contextItemIds = this.getContextItemIds(true, true, false);
    if (contextItemIds.length > 0) {
      if (await this._isColorSet(contextItemIds)) {
        this.isUnsettingColor = true;
      } else {
        this.isUnsettingColor = false;
      }
    } else {
      this.isUnsettingColor = false;
    }
  }

  get contextMenuModel(): IContextMenuModel | undefined {
    return this.model;
  }

  set contextMenuModel(model: IContextMenuModel | undefined) {
    const oldValue = this.model;
    this.model = model;
    this.requestUpdate('model', oldValue);
    this.createIsolateZoomHelper();
  }

  get contextMenuWebViewer(): IContextMenuWebViewer | undefined {
    return this.webViewer;
  }

  set contextMenuWebViewer(webViewer: IContextMenuWebViewer | undefined) {
    const oldValue = this.webViewer;
    this.webViewer = webViewer;
    this.requestUpdate('webViewer', oldValue);
    this.createIsolateZoomHelper();
  }

  private notifyItemClicked() {
    this.dispatchEvent(
      new CustomEvent<{ source: HTMLElement } & MouseEvent>('context-menu-item-clicked', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private isMenuItemVisible(): boolean {
    const activeItemVisible = this.isItemVisible(this.activeItemId);
    const activeLayerVisible = this.isLayerVisibile(this.activeLayerName);
    const activeTypeVisibile = this.isTypeVisible(this.activeType);

    return activeItemVisible || activeLayerVisible || activeTypeVisibile;
  }

  private createIsolateZoomHelper() {
    if (this.webViewer && this.model) {
      this.isolateZoomHelper = new IsolateZoomHelper(this.webViewer, this.model);
    }
  }

  handleServiceUpdate = (): void => this.requestUpdate();

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('contextmenu', this._handleContextMenu);

    this.explodeService = getService<IExplodeService>('ExplodeService');
    this.explodeService.addEventListener('hoops-explode-service-reset', this.handleServiceUpdate);
    this.explodeService.addEventListener('hoops-explode-started', this.handleServiceUpdate);
    this.explodeService.addEventListener('hoops-explode-stopped', this.handleServiceUpdate);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('contextmenu', this._handleContextMenu);

    if (this.explodeService) {
      this.explodeService.removeEventListener(
        'hoops-explode-service-reset',
        this.handleServiceUpdate,
      );
      this.explodeService.removeEventListener('hoops-explode-started', this.handleServiceUpdate);
      this.explodeService.removeEventListener('hoops-explode-stopped', this.handleServiceUpdate);
    }
  }

  private _handleContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  private isAllIfcSpace(nodeIds: NodeId[]) {
    return nodeIds.every((nodeId) => {
      return this.model?.hasEffectiveGenericType(nodeId, 'IFCSPACE');
    });
  }

  private isMenuItemExecutable(): boolean {
    if (this.webViewer) {
      return (
        this.activeItemId !== null ||
        this.activeLayerName !== null ||
        this.activeType !== null ||
        this.webViewer.selectionManager.size() > 0
      );
    }
    return false;
  }

  private isHandleExecutable(): boolean {
    return this.isMenuItemExecutable() && !this.explodeService.getActive();
  }

  private async isolateFunc() {
    if (this.isMenuItemExecutable()) {
      this.notifyItemClicked();
      const nodeIds = this.getContextItemIds(true, true);
      await this.isolateZoomHelper?.isolateNodes(
        nodeIds,
        this.isAllIfcSpace(nodeIds) ? false : null,
      );
    }
  }

  private async zoomFunc() {
    if (this.isMenuItemExecutable()) {
      this.notifyItemClicked();
      await this.isolateZoomHelper?.fitNodes(this.getContextItemIds(true, true));
    }
  }

  // Returns the first encountered leaf node
  private drillNodes(nodeId: NodeId): NodeId {
    const children = this.model!.getNodeChildren(nodeId);
    if (children.length === 0) {
      return nodeId;
    }
    return this.drillNodes(children[0]);
  }

  private async visibilityFunc() {
    if (this.isMenuItemExecutable()) {
      const hidden = !this.isMenuItemVisible();
      const nodeIds = this.getContextItemIds(true, true);
      this.notifyItemClicked();
      await this.model?.setNodesVisibility(
        nodeIds,
        hidden,
        this.isAllIfcSpace(nodeIds) ? false : null,
      );
      this.requestUpdate();
    }
  }

  private async transparentFunc() {
    if (this.isMenuItemExecutable()) {
      const contextItemIds = this.getContextItemIds(true, true);
      const leaf = this.drillNodes(contextItemIds[0]);
      const opacityOfFirstItem = (
        await this.model!.getNodesEffectiveOpacity([leaf], ElementType.Faces)
      )[0];

      if (opacityOfFirstItem === null || opacityOfFirstItem === 1) {
        this.model?.setNodesOpacity(contextItemIds, 0.5);
      } else {
        this.model?.resetNodesOpacity(contextItemIds);
      }
      this.notifyItemClicked();
    }
  }

  private async handlesFunc() {
    if (this.isHandleExecutable()) {
      const handleOperator = this.webViewer?.view.operatorManager.getOperator(OperatorId.Handle);
      const contextItemIds = this.getContextItemIds(true, true, false);
      if (contextItemIds.length > 0) {
        this.notifyItemClicked();
        await handleOperator?.addHandles(contextItemIds, this.position);
      }
    }
  }

  private async resetFunc() {
    this.notifyItemClicked();
    const handleOperator = this.webViewer?.view.operatorManager.getOperator(OperatorId.Handle);
    await handleOperator?.removeHandles();
    await this.model?.reset();
    this.model?.unsetNodesFaceColor([this.model.getAbsoluteRootNode()]);
    this.model?.setPmiColorOverride(this.model.getPmiColorOverride());
  }

  meshLevelFunc(meshLevel: number) {
    if (this.isMenuItemExecutable()) {
      this.model?.setMeshLevel(this.getContextItemIds(true, true), meshLevel);
    }
  }

  private async showAllFunc() {
    this.notifyItemClicked();
    await this.isolateZoomHelper?.showAll();
  }

  private async setColorFunc() {
    if (this.isMenuItemExecutable()) {
      const contextItemIds = this.getContextItemIds(true, true, false);
      if (this.isUnsettingColor) {
        this.model?.unsetNodesFaceColor(contextItemIds);
      } else {
        this.model?.setNodesFaceColor(contextItemIds, Color.fromHexString(this.color));
      }
      this.notifyItemClicked();
    }
  }

  private async _isColorSet(contextItemIds: NodeId[]): Promise<boolean> {
    let colorSet = true;

    for (let i = 0; i < contextItemIds.length; ++i) {
      const colorMap: Map<NodeId, Color> =
        (await this.model?.getNodeColorMap(contextItemIds[i], ElementType.Faces)) ?? new Map();
      if (colorMap.size === 0) {
        return false;
      } else {
        colorMap.forEach((color) => {
          if (!color.equals(Color.fromHexString(this.color))) {
            colorSet = false;
          }
        });
      }
    }

    return colorSet;
  }

  private isItemVisible(nodeId: NodeId | null): boolean {
    if (nodeId === null) {
      const selectionItems = this.webViewer?.selectionManager.getResults();
      if (selectionItems?.length === 0) {
        return false;
      }
      nodeId = selectionItems?.at(0)?.getNodeId() ?? null;
    }
    if (nodeId) {
      return this.model?.getNodeVisibility(nodeId) ?? false;
    } else {
      return false;
    }
  }

  private isLayerVisibile(layerName: LayerName | null): boolean {
    if (layerName) {
      const layerIds = this.model?.getLayerIdsFromName(layerName);
      if (layerIds) {
        for (const layerId of layerIds) {
          const nodeIds = this.model?.getNodesFromLayer(layerId);
          if (nodeIds) {
            for (const nodeId of nodeIds) {
              if (this.model?.getNodeVisibility(nodeId)) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  private isTypeVisible(genericType: GenericType | null): boolean {
    let typeVisible = false;
    if (genericType !== null) {
      const nodeIds = this.model?.getNodesByGenericType(genericType);
      if (nodeIds) {
        nodeIds.forEach((nodeId: any) => {
          typeVisible = this.model?.getNodeVisibility(nodeId) ?? false;
        });
      }
    }
    return typeVisible;
  }

  public getContextItemIds(
    includeSelected: boolean,
    includeClicked: boolean,
    includeRoot = true,
  ): NodeId[] {
    const selectionManager = this.webViewer?.selectionManager;

    const model = this.model;
    const rootId = model?.getAbsoluteRootNode();
    const itemIds: NodeId[] = [];

    // selected items
    if (includeSelected) {
      const selectedItems = selectionManager?.getResults();
      for (const item of selectedItems?.values() ?? []) {
        const id = item.getNodeId();
        if (model && (includeRoot || (!includeRoot && id !== rootId))) {
          itemIds.push(id);
        }
      }
    }

    if (this.activeLayerName !== null) {
      const layerIds = this.model?.getLayerIdsFromName(this.activeLayerName);
      if (layerIds) {
        for (const layerId of layerIds) {
          const nodeIds = this.model?.getNodesFromLayer(layerId);
          if (nodeIds) {
            for (const nodeId of nodeIds) {
              const selectionItem = Selection.SelectionItem.create(nodeId);
              if (!selectionManager?.contains(selectionItem)) {
                itemIds.push(nodeId);
              }
            }
          }
        }
      }
    }

    if (this.activeType !== null) {
      const nodeIds = this.model?.getNodesByGenericType(this.activeType);
      if (nodeIds) {
        nodeIds.forEach((nodeId) => {
          const selectionItem = Selection.SelectionItem.create(nodeId);
          if (!selectionManager?.contains(selectionItem)) {
            itemIds.push(nodeId);
          }
        });
      }
    }

    if (this.activeItemId !== null) {
      const selectionItem = Selection.SelectionItem.create(this.activeItemId);
      const containsParent = selectionManager?.containsParent(selectionItem) !== null;
      const containsItem = itemIds.indexOf(this.activeItemId) !== -1;

      // also include items if they are clicked on but not selected (and not a child of a parent that is selected)
      if (
        includeClicked &&
        (includeRoot ||
          (!includeRoot &&
            this.activeItemId !== rootId &&
            (itemIds.length === 0 || (!containsItem && !containsParent))))
      ) {
        itemIds.push(this.activeItemId);
      }
    }

    return itemIds;
  }
}

export { HoopsContextMenuElement };
