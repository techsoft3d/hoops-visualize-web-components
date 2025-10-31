import { HTMLTemplateResult, LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { ModelAdapter } from './model-adapter';
import { CadConfigurationData, IModel } from './types';
import { componentBaseStyle } from '@ts3d-hoops/ui-kit';

export type * from './custom-events.d.ts';

/**
 * This class implements the CAD configuration list web component. It has no property but it
 * has some members and methods. In order to set the model you can assign it to
 * HoopsCadConfigurationListElement.model and it will update automatically.
 *
 * It mainly relies on ModelAdapter to proxy the web viewer model and allow
 * customization of the cad configuration list.
 *
 * Event `hoops-cad-configuration-list-click` is dispatched when a cad configuration is clicked.
 *
 * @export
 * @class HoopsCadConfigurationListElement
 * @typedef {HoopsCadConfigurationListElement}
 * @extends {LitElement}
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
   * The IModel interface that represents the Model.
   *
   * This is a syntactic sugar to access HoopsCadConfigurationListElement.modelAdapter.model.
   * If the ModelAdapter is not set it returns an undefined.
   *
   * Reassigning the model will trigger a reset of the tree.
   *
   * Trying to set the model while the modelAdapter is not set would result in
   * an error being thrown.
   *
   * This should not happen in a normal use case since the modelAdapter is added
   * at initialization.
   *
   * @type {(IModel | undefined)}
   */
  get model(): IModel | undefined {
    return this.modelAdapter?.model;
  }

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
   * ModelAdapter
   *
   * Model adapter is used to proxy the web viewer model and allow
   * customization of the cad configuration list.
   *
   * Reassigning the modelAdapter will trigger an update.
   *
   * @public
   * @type {(ModelAdapter | undefined)}
   */
  @property({ attribute: false })
  public modelAdapter?: ModelAdapter = new ModelAdapter();

  /**
   * This property holds the active cad configuration id.
   * Set to undefined if no active cad configuration is set.
   *
   * @public
   * @type {number}
   */
  @property({ attribute: false })
  public active?: number = undefined;

  /**
   * Internal data for the configuration list
   * Undefined means the data is not cached from the model yet.
   *
   * @private
   * @type {CadConfigurationData[]}
   */
  @state()
  private cadConfigurationData?: CadConfigurationData[] = undefined;

  private reset() {
    this.cadConfigurationData = undefined;
    this.active = undefined;
  }

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
