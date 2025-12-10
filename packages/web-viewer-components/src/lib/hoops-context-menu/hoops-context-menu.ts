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

/**
 * Provides a context menu component for 3D model interactions and operations.
 *
 * This component displays a contextual menu with actions like isolate, zoom, visibility toggles,
 * transparency controls, color setting, and model operations. It integrates with the web viewer
 * and model to provide interactive functionality for selected nodes, layers, or types.
 *
 * The menu dynamically positions itself to stay within viewport bounds and updates its state
 * based on current selections and model properties.
 *
 * @element hoops-context-menu
 *
 * @fires context-menu-item-clicked - Emitted when any context menu item is clicked
 *
 * @cssprop --hoops-neutral-background-20 - Background color for the context menu
 * @cssprop --hoops-accent-foreground-hover - Text color for menu items on hover
 * @cssprop --hoops-accent-foreground-disabled - Text color for disabled menu items
 *
 * @attribute {number} x - X coordinate for menu positioning
 * @attribute {number} y - Y coordinate for menu positioning
 * @attribute {string} activeItemId - ID of the currently active/selected item
 * @attribute {string} activeLayerName - Name of the currently active layer
 * @attribute {string} activeType - Type of the currently active generic type
 * @attribute {string} color - Current color value for color operations
 * @attribute {boolean} isUnsettingColor - Whether the color operation is unsetting vs setting
 *
 * @example
 * ```html
 * <hoops-context-menu x="100" y="150" activeitemid="node123"></hoops-context-menu>
 *
 * <script>
 *   document.getElementsByTagName('hoops-context-menu')[0].addEventListener('context-menu-item-clicked', (event) => {
 *     console.log('Menu item clicked:', event.detail);
 *   });
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
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

  /**
   * Renders the context menu component template.
   *
   * Creates a menu with contextual actions based on current selection state and model properties.
   * Menu items are dynamically enabled/disabled based on context and current state.
   *
   * @returns {unknown} The HTML template for the context menu
   */
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

  /**
   * Handles color picker input change events.
   *
   * Updates the component's color property when the user selects a new color
   * from the color picker input element.
   *
   * @internal
   * @param event - The input change event from the color picker
   * @returns {void}
   */
  private handleColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.color = input.value;
  }

  /**
   * Handles component updates and positions the menu within viewport bounds.
   *
   * Automatically repositions the menu if it would extend beyond window boundaries
   * and updates the color state based on current context.
   *
   * @param _changedProperties - Map of changed properties (unused)
   * @returns {void}
   */
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

  /**
   * Updates the color operation state based on current context items.
   *
   * Determines whether the color action should be "Set Color" or "Unset Color"
   * based on whether the selected items already have the current color applied.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Gets or sets the context menu model interface.
   *
   * The model provides access to 3D model operations like visibility, color, and node queries.
   * Setting a new model triggers helper recreation and component updates.
   *
   * @returns {IContextMenuModel | undefined} The current model instance or undefined
   */
  get contextMenuModel(): IContextMenuModel | undefined {
    return this.model;
  }

  /**
   * Sets the context menu model interface.
   *
   * @param model - The model instance to use for 3D operations
   * @returns {void}
   */
  set contextMenuModel(model: IContextMenuModel | undefined) {
    const oldValue = this.model;
    this.model = model;
    this.requestUpdate('model', oldValue);
    this.createIsolateZoomHelper();
  }

  /**
   * Gets or sets the web viewer interface for context menu operations.
   *
   * The web viewer provides access to selection management, operators, and view controls.
   * Setting a new web viewer triggers helper recreation and component updates.
   *
   * @returns {IContextMenuWebViewer | undefined} The current web viewer instance or undefined
   */
  get contextMenuWebViewer(): IContextMenuWebViewer | undefined {
    return this.webViewer;
  }

  /**
   * Sets the web viewer interface for context menu operations.
   *
   * @param webViewer - The web viewer instance to use for operations
   * @returns {void}
   */
  set contextMenuWebViewer(webViewer: IContextMenuWebViewer | undefined) {
    const oldValue = this.webViewer;
    this.webViewer = webViewer;
    this.requestUpdate('webViewer', oldValue);
    this.createIsolateZoomHelper();
  }

  /**
   * Notifies parent components that a context menu item was clicked.
   *
   * Dispatches a custom event to inform listeners that any context menu action
   * was executed, allowing parent components to respond appropriately (e.g., hide menu).
   *
   * @internal
   * @returns {void}
   */
  private notifyItemClicked() {
    this.dispatchEvent(
      new CustomEvent<{ source: HTMLElement } & MouseEvent>('context-menu-item-clicked', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Determines if the context menu items should show as visible/hidden.
   *
   * Checks the visibility state of active items, layers, and types to determine
   * whether the visibility toggle should show "Hide" or "Show" text.
   *
   * @internal
   * @returns {boolean} True if any active context items are currently visible
   */
  private isMenuItemVisible(): boolean {
    const activeItemVisible = this.isItemVisible(this.activeItemId);
    const activeLayerVisible = this.isLayerVisibile(this.activeLayerName);
    const activeTypeVisibile = this.isTypeVisible(this.activeType);

    return activeItemVisible || activeLayerVisible || activeTypeVisibile;
  }

  /**
   * Creates a new IsolateZoomHelper instance when both webViewer and model are available.
   *
   * Initializes the helper class that provides isolate and zoom functionality
   * for context menu operations. Called when model or webViewer properties change.
   *
   * @internal
   * @returns {void}
   */
  private createIsolateZoomHelper() {
    if (this.webViewer && this.model) {
      this.isolateZoomHelper = new IsolateZoomHelper(this.webViewer, this.model);
    }
  }

  /**
   * Handles service update events and triggers component re-render.
   *
   * @returns {void}
   */
  handleServiceUpdate = (): void => this.requestUpdate();

  /**
   * Lifecycle callback when component is added to the DOM.
   *
   * Sets up event listeners for context menu prevention and explode service events.
   *
   * @returns {void}
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('contextmenu', this._handleContextMenu);

    this.explodeService = getService<IExplodeService>('ExplodeService');
    this.explodeService.addEventListener('hoops-explode-service-reset', this.handleServiceUpdate);
    this.explodeService.addEventListener('hoops-explode-started', this.handleServiceUpdate);
    this.explodeService.addEventListener('hoops-explode-stopped', this.handleServiceUpdate);
  }

  /**
   * Lifecycle callback when component is removed from the DOM.
   *
   * Cleans up event listeners for context menu prevention and explode service events.
   *
   * @returns {void}
   */
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

  /**
   * Prevents the browser's default context menu from appearing.
   *
   * Intercepts right-click context menu events to ensure only the custom
   * hoops context menu is shown, preventing conflicts with browser menus.
   *
   * @internal
   * @param event - The right-click mouse event to prevent
   * @returns {void}
   */
  private _handleContextMenu(event: MouseEvent) {
    event.preventDefault();
  }

  /**
   * Checks if all provided nodes are IFC space elements.
   *
   * Determines whether the given node IDs all represent IFCSPACE elements,
   * which may require special handling in certain operations.
   *
   * @internal
   * @param nodeIds - Array of node IDs to check
   * @returns {boolean} True if all nodes are IFC space elements
   */
  private isAllIfcSpace(nodeIds: NodeId[]) {
    return nodeIds.every((nodeId) => {
      return this.model?.hasEffectiveGenericType(nodeId, 'IFCSPACE');
    });
  }

  /**
   * Determines if context menu items should be executable/enabled.
   *
   * Checks if there are any active context items (selected nodes, active layer,
   * active type, or current selections) that would make menu operations valid.
   *
   * @internal
   * @returns {boolean} True if menu items can be executed based on current context
   */
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

  /**
   * Determines if handle operations should be executable/enabled.
   *
   * Checks if menu items are executable and explode mode is not currently active,
   * as handles cannot be used during model explosion.
   *
   * @internal
   * @returns {boolean} True if handle operations can be executed
   */
  private isHandleExecutable(): boolean {
    return this.isMenuItemExecutable() && !this.explodeService.getActive();
  }

  /**
   * Executes the isolate operation on context items.
   *
   * Hides all model elements except the currently active context items,
   * providing a focused view. Special handling for IFC space elements.
   *
   * @internal
   * @returns {Promise<void>}
   */
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

  /**
   * Executes the zoom-to-fit operation on context items.
   *
   * Adjusts the camera view to fit all currently active context items
   * within the viewport bounds for optimal viewing.
   *
   * @internal
   * @returns {Promise<void>}
   */
  private async zoomFunc() {
    if (this.isMenuItemExecutable()) {
      this.notifyItemClicked();
      await this.isolateZoomHelper?.fitNodes(this.getContextItemIds(true, true));
    }
  }

  /**
   * Traverses the model hierarchy to find the first leaf node.
   *
   * Recursively drills down through the node hierarchy to find a leaf node
   * (a node with no children), used for opacity and property queries.
   *
   * @internal
   * @param nodeId - The starting node ID to drill down from
   * @returns {NodeId} The ID of the first encountered leaf node
   */
  private drillNodes(nodeId: NodeId): NodeId {
    const children = this.model!.getNodeChildren(nodeId);
    if (children.length === 0) {
      return nodeId;
    }
    return this.drillNodes(children[0]);
  }

  /**
   * Toggles the visibility of context items.
   *
   * Shows or hides the currently active context items based on their current
   * visibility state. Special handling for IFC space elements.
   *
   * @internal
   * @returns {Promise<void>}
   */
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

  /**
   * Toggles transparency on context items.
   *
   * Sets context items to 50% opacity if they are currently opaque (opacity = 1 or null),
   * or resets them to full opacity if they are currently transparent.
   *
   * @internal
   * @returns {Promise<void>}
   */
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

  /**
   * Adds interactive handles to context items for manipulation.
   *
   * Creates 3D manipulation handles on the currently selected context items,
   * allowing users to interactively move, rotate, or scale objects. Only works
   * when explode mode is not active.
   *
   * @internal
   * @returns {Promise<void>}
   */
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

  /**
   * Resets the entire model to its initial state.
   *
   * Performs a comprehensive reset including:
   * - Removes all manipulation handles
   * - Resets model visibility, colors, and transformations
   * - Clears face color overrides
   * - Resets PMI color override settings
   *
   * @internal
   * @returns {Promise<void>}
   */
  private async resetFunc() {
    this.notifyItemClicked();
    const handleOperator = this.webViewer?.view.operatorManager.getOperator(OperatorId.Handle);
    await handleOperator?.removeHandles();
    await this.model?.reset();
    this.model?.unsetNodesFaceColor([this.model.getAbsoluteRootNode()]);
    this.model?.setPmiColorOverride(this.model.getPmiColorOverride());
  }

  /**
   * Sets the mesh level for context items.
   *
   * Updates the level of detail for mesh rendering on the currently selected
   * or context items if menu operations are executable.
   *
   * @param meshLevel - The mesh level to apply (higher = more detailed)
   * @returns {void}
   */
  meshLevelFunc(meshLevel: number) {
    if (this.isMenuItemExecutable()) {
      this.model?.setMeshLevel(this.getContextItemIds(true, true), meshLevel);
    }
  }

  /**
   * Shows all model elements and fits them in the view.
   *
   * Restores visibility to all previously hidden elements and adjusts
   * the camera view to fit the entire model within the viewport.
   *
   * @internal
   * @returns {Promise<void>}
   */
  private async showAllFunc() {
    this.notifyItemClicked();
    await this.isolateZoomHelper?.showAll();
  }

  /**
   * Sets or unsets the face color for context items.
   *
   * Applies the current color picker value to context items if setting color,
   * or removes color overrides if unsetting color. The operation mode is
   * determined by the isUnsettingColor state.
   *
   * @internal
   * @returns {Promise<void>}
   */
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

  /**
   * Checks if the current color is already set on the provided context items.
   *
   * Determines whether all the given node IDs already have the current color
   * applied to their faces, which affects whether the color action should be
   * "Set Color" or "Unset Color".
   *
   * @internal
   * @param contextItemIds - Array of node IDs to check for color state
   * @returns {Promise<boolean>} True if the current color is set on all items
   */
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

  /**
   * Checks the visibility state of a specific node item.
   *
   * Determines if the given node ID is currently visible in the model.
   * If nodeId is null, checks the first selected item instead.
   *
   * @internal
   * @param nodeId - The node ID to check visibility for, or null to check first selection
   * @returns {boolean} True if the item is visible, false otherwise
   */
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

  /**
   * Checks if any nodes in the specified layer are visible.
   *
   * Iterates through all layer IDs matching the layer name and checks
   * if any nodes within those layers are currently visible.
   *
   * @internal
   * @param layerName - The name of the layer to check visibility for
   * @returns {boolean} True if any nodes in the layer are visible
   */
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

  /**
   * Checks if any nodes of the specified generic type are visible.
   *
   * Iterates through all nodes matching the generic type and checks
   * if any of them are currently visible in the model.
   *
   * @internal
   * @param genericType - The generic type to check visibility for
   * @returns {boolean} True if any nodes of the type are visible
   */
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

  /**
   * Retrieves the node IDs that are currently in context for operations.
   *
   * Collects node IDs from various sources based on the provided parameters:
   * selected items, clicked items, active layer, and active type. This method
   * determines which nodes should be affected by context menu operations.
   *
   * @param includeSelected - Whether to include currently selected nodes
   * @param includeClicked - Whether to include the clicked/active node
   * @param includeRoot - Whether to include root nodes in the results
   * @returns {NodeId[]} Array of node IDs that are in context for operations
   */
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
