import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ModelAdapter } from './model-adapter';
import { CadConfigurationData, IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

export type * from './custom-events.d.ts';

/**
 * Provides a selectable list of CAD configurations for 3D model viewing.
 *
 * This web component displays available CAD configurations from a model and allows users
 * to select different configurations. It automatically integrates with the model adapter
 * to fetch configuration data and provides click interaction for configuration switching.
 *
 * @element hoops-cad-configuration-list
 *
 * @fires hoops-cad-configuration-list-click - Emitted when a CAD configuration is clicked, includes configuration ID and mouse event details
 *
 * @attribute {number} active - The ID of the currently active CAD configuration
 *
 * @example
 * ```html
 * <hoops-cad-configuration-list active="1"></hoops-cad-configuration-list>
 *
 * <script>
 *   document.getElementsByTagName('hoops-cad-configuration-list')[0].modelAdapter = adapter;
 * </script>
 * ```
 *
 * @since 2025.8.0
 */
@customElement('hoops-cad-configuration-list')
export class HoopsCadConfigurationListElement extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      :host {
        height: 100%;
        overflow: auto;
      }
      .title {
        font-size: 1.2rem;
        font-weight: normal;
        margin: 0.5rem 0;
      }
      .list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .list-item {
      }
    `,
  ];

  /**
   * Gets or sets the 3D model containing CAD configurations.
   *
   * This is a convenience accessor for the modelAdapter's model property.
   * Setting a new model will reset the component state and reload configuration data.
   *
   * @returns {IModel | undefined} The current model, or undefined if no model adapter is set
   * @throws {Error} When attempting to set a model without a configured model adapter
   */
  get model(): IModel | undefined {
    return this.modelAdapter?.model;
  }

  /**
   * @param model - The model to set
   * @returns {void}
   */
  set model(model: IModel | undefined) {
    const modelAdapter = this.modelAdapter;
    if (!modelAdapter) {
      throw new Error(`HoopsCadConfigurationListElement.model [set]: ModelAdapter is not set.`);
    }

    modelAdapter.model = model;
    this.modelAdapter = modelAdapter;
    this.reset();
  }

  /**
   * Model adapter used to proxy the web viewer model and allow customization of the CAD configuration list.
   *
   * Reassigning the modelAdapter will trigger an update of the component.
   *
   * @default new ModelAdapter()
   */
  @property({ attribute: false })
  public modelAdapter?: ModelAdapter = new ModelAdapter();

  /**
   * The ID of the currently active CAD configuration.
   *
   * When set, highlights the corresponding configuration in the list.
   * Set to undefined if no active configuration is selected.
   *
   * @default undefined
   */
  @property({ attribute: false })
  public active?: number = undefined;

  /**
   * Internal data for the configuration list
   * Undefined means the data is not cached from the model yet.
   *
   * @type {CadConfigurationData[]}
   */
  @state()
  private cadConfigurationData?: CadConfigurationData[] = undefined;

  /**
   * Resets the component state by clearing the cached configuration data and active selection.
   * Called when the model or model adapter changes to ensure fresh data loading.
   *
   * @internal
   * @returns {void}
   */
  private reset() {
    this.cadConfigurationData = undefined;
    this.active = undefined;
  }

  /**
   * Generates HTML template results for all CAD configuration items.
   * Loads configuration data from model adapter if not cached, then maps each
   * configuration to a clickable list item element.
   *
   * @internal
   * @returns {HTMLTemplateResult[]} Array of HTML templates for configuration list items
   */
  private getCadConfigurationHtmlElements(): HTMLTemplateResult[] {
    if (!this.modelAdapter) {
      return [];
    }
    if (this.cadConfigurationData === undefined) {
      this.cadConfigurationData = this.modelAdapter.getCadConfigurations();
    }
    if (!this.cadConfigurationData) {
      return [];
    }

    return this.cadConfigurationData.map((cadConfiguration) => {
      const cadConfigurationActive = this.active === cadConfiguration.cadConfigurationId;
      const cadConfigurationHtmlElement = this.modelAdapter!.getContent(
        cadConfiguration,
        cadConfigurationActive,
      );
      return html`<li
        class="list-item"
        @click=${(event: MouseEvent) => {
          this.handleClick(event, cadConfiguration.cadConfigurationId);
        }}
      >
        ${cadConfigurationHtmlElement}
      </li>`;
    });
  }

  /**
   * Handles click events on CAD configuration list items.
   * Stops event propagation and dispatches a custom event with configuration details.
   *
   * @internal
   * @param event - The mouse click event
   * @param cadConfigurationId - ID of the clicked CAD configuration
   * @returns {void}
   */
  private handleClick(event: MouseEvent, cadConfigurationId: number) {
    event.stopPropagation();
    const detail = {
      cadConfigurationId,
      ...event,
    };

    this.dispatchEvent(
      new CustomEvent<{ cadConfigurationId: number } & MouseEvent>(
        'hoops-cad-configuration-list-click',
        {
          bubbles: true,
          composed: true,
          detail,
        },
      ),
    );
  }

  /**
   * Renders the CAD configuration list component.
   * Creates a titled list with clickable configuration items generated from the model data.
   *
   * @internal
   * @returns {unknown} HTML template for the configuration list
   */
  protected override render(): unknown {
    const cadConfigurationHtmlElements = this.getCadConfigurationHtmlElements();
    return html`<div>
      <h2 class="title">Configurations</h2>
      <ul class="list">
        ${cadConfigurationHtmlElements}
      </ul>
    </div>`;
  }
}

export default HoopsCadConfigurationListElement;
