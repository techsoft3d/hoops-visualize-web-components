import { LitElement, css, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { createRef, ref } from 'lit/directives/ref.js';

import { SheetAdapter } from './SheetAdapter';
import { IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';
import {
  BaseMouseEvent,
  List,
  ContextWrapper,
} from '@ts3d-hoops/ui-kit/list';

export type * from './custom-events.d.ts';

/**
 * Displays a flat list of drawing sheets from the model. Clicking a sheet node
 * fires an event that consumers can use to activate the corresponding sheet.
 *
 * @element hoops-sheet-list
 *
 * @fires hoops-sheet-list-node-click - Emitted when a sheet node is clicked
 *
 * @example
 * ```html
 * <hoops-sheet-list></hoops-sheet-list>
 *
 * <script>
 *   const el = document.getElementsByTagName('hoops-sheet-list')[0];
 *   el.model = modelInstance;
 *   el.addEventListener('hoops-sheet-list-node-click', (e) => console.log(e.detail));
 * </script>
 * ```
 *
 * @since 2026.3.0
 */
@customElement('hoops-sheet-list')
export class HoopsSheetListElement extends LitElement {
  /** @internal */
  static styles = [
    componentBaseStyle,
    css`
      .sheetlist {
        height: 100%;
        overflow: auto;
      }
    `,
  ];

  /** @internal */
  private listRef = createRef<List>();

  /**
   * Gets the internal list component element.
   *
   * @returns {List | undefined} The list element instance or undefined if not initialised
   */
  get listElement(): List | undefined {
    return this.listRef.value;
  }

  /**
   * Gets the currently selected sheet nodes.
   *
   * @returns {number[]} Array of selected node IDs
   */
  get selected(): number[] {
    return this.listElement?.selected ?? [];
  }

  /**
   * Sets the currently selected sheet nodes.
   *
   * @param value - Array of node IDs to select
   * @returns {void}
   * @throws {Error} When setting selected nodes before list initialisation
   */
  set selected(value: number[]) {
    if (!this.listElement) {
      throw new Error('HoopsSheetList.selected [set]: List element is not set.');
    }
    this.listElement.selected = value;
  }

  /**
   * Convenience accessor for the model on the underlying adapter.
   *
   * @returns {IModel | undefined} The current model instance or undefined
   */
  get model(): IModel | undefined {
    return this.sheetAdapter?.model;
  }

  /**
   * Sets the model instance for sheet data. Setting a new model refreshes the list.
   *
   * @param model - The model instance to set
   * @returns {void}
   * @throws {Error} When setting model before adapter initialisation
   */
  set model(model: IModel | undefined) {
    const adapter = this.sheetAdapter;
    if (!adapter) {
      throw new Error('HoopsSheetList.model [set]: SheetAdapter is not set.');
    }

    adapter.model = model;
    this.sheetAdapter = adapter;
  }

  /**
   * Gets the sheet adapter managing list data.
   *
   * @returns {SheetAdapter | undefined} The current sheet adapter or undefined
   */
  public get sheetAdapter(): SheetAdapter | undefined {
    return this.listElement?.list.context as SheetAdapter | undefined;
  }

  /**
   * Sets the sheet adapter managing list data.
   * Populates `elementsData` from the adapter's model before assigning.
   *
   * @param value - The sheet adapter to set
   * @returns {void}
   * @throws {Error} When setting adapter before list initialisation
   */
  public set sheetAdapter(value: SheetAdapter) {
    if (!this.listElement) {
      throw new Error('HoopsSheetList.sheetAdapter [set]: List element is not set.');
    }

    const sheetIds = value.model?.getSheetIds() ?? [];
    const elementsData = new Map<number, string>();
    sheetIds.forEach((id) => {
      elementsData.set(id, value.model?.getNodeName(id) ?? 'Unnamed sheet');
    });

    this.listElement.list = { context: value };
    this.listElement.list.context.elementsData = elementsData;
  }

  /**
   * Selects or deselects sheet nodes.
   *
   * @param nodeIds - Array of node IDs to select or deselect
   * @param selected - Whether to select (true) or deselect (false) the nodes
   * @returns {void}
   * @throws {Error} When list element is not initialised
   */
  selectNodes(nodeIds: number[], selected: boolean): void {
    if (!this.listElement) {
      throw new Error('HoopsSheetList.selectNodes: List element is not set.');
    }

    let selection = this.listElement.selected;
    if (!selected) {
      selection = selection.filter((current) => !nodeIds.includes(current));
    } else {
      selection = nodeIds;
    }

    this.listElement.selected = selection;
  }

  /**
   * Handles list element click events and re-dispatches them as
   * `hoops-sheet-list-node-click`.
   *
   * @internal
   * @param event - The list element click event
   * @returns {void}
   */
  private onSheetNodeClicked(
    event: CustomEvent<{ key: number; source: HTMLElement } & BaseMouseEvent>,
  ) {
    event.stopPropagation();
    const { key, ...rest } = event.detail;

    this.dispatchEvent(
      new CustomEvent('hoops-sheet-list-node-click', {
        bubbles: true,
        composed: true,
        detail: {
          nodeId: key,
          ...rest,
        },
      }),
    );
  }

  /** @internal */
  protected override render(): unknown {
    return html`<hoops-list
      class="sheetlist"
      .list=${{ context: new SheetAdapter() } as ContextWrapper}
      @hoops-list-element-click=${this.onSheetNodeClicked}
      ${ref(this.listRef)}
    ></hoops-list>`;
  }
}

export default HoopsSheetListElement;
