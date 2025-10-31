import { html, HTMLTemplateResult, nothing } from 'lit';

import './hoops-cad-configuration-list-item';
import { CadConfigurationData, IModel } from './types';

/**
 * The signature of the callback used by ModelAdapter to create item for the
 * `hoops-cad-configuration-list`
 *
 * @export
 * @typedef {CadConfigurationListItemFactory}
 */
export type CadConfigurationListItemFactory = (
  modelAdapter: ModelAdapter,
  cadConfigurationId: number,
  active?: boolean,
) => HTMLTemplateResult | typeof nothing;

/**
 * Create a `hoops-cad-configuration-list-item` to render in the cad configuration list. If cadConfigurationId is not set
 * or is NaN then nothing is displayed.
 *
 * @export
 * @param {ModelAdapter} modelAdapter The model adapter
 * @param {number} cadConfigurationId The id of the cad configuration to render
 * @param {?boolean} [active] whether the cad configuration is active or not
 * @returns {(HTMLTemplateResult | typeof nothing)} The HTML fragment to display
 */
export function defaultItemFactory(
  modelAdapter: ModelAdapter,
  cadConfigurationId: number,
  active?: boolean,
): HTMLTemplateResult | typeof nothing {
  let configurationName = 'N/A';
  if (modelAdapter.model) {
    const cadConfigurations = modelAdapter.model.getCadConfigurations();
    configurationName = cadConfigurations[cadConfigurationId] || 'N/A';
  }

  return html`<hoops-cad-configuration-list-item
    cadConfigurationId=${cadConfigurationId}
    cadConfigurationName=${configurationName}
    ?active=${active}
  >
  </hoops-cad-configuration-list-item>`;
}

export const CadConfigurationRootId = -1;

/**
 * This class serves as a proxy to the Model class. I is used by the HoopsCadConfigurationListElement
 * to communicate with the Model.
 *
 * @export
 * @class ModelAdapter
 * @typedef {ModelAdapter}
 */
export class ModelAdapter {
  /**
   * The Model where the cad configurations will be queried.
   *
   * @type {?IModel}
   */
  model?: IModel;

  /**
   * A function that creates a HTML fragment for a cad configuration.
   *
   * @type {CadConfigurationListItemFactory}
   */
  itemFactory: CadConfigurationListItemFactory = defaultItemFactory;

  /**
   * Get cad configurations from the model and format them to the desired format
   *
   * @returns {CadConfigurationData[]} the cad configurations
   */
  getCadConfigurations(): CadConfigurationData[] {
    if (!this.model) {
      return [];
    }
    const cadConfigurations = this.model.getCadConfigurations();
    return Object.entries(cadConfigurations).map(([key, value]) => ({
      cadConfigurationId: parseInt(key, 10),
      cadConfigurationName: value,
    }));
  }

  /**
   * Return the HTML Fragment for a cad configuration.
   * @param cadConfigurationData The id of the cad configuration to render.
   * @param active Whether the cad configuration is active or not.
   * @returns The HTML fragment to render for the node.
   */
  getContent(
    cadConfigurationData: CadConfigurationData,
    active: boolean,
  ): HTMLTemplateResult | typeof nothing {
    return this.itemFactory(this, cadConfigurationData.cadConfigurationId, active);
  }
}

export default ModelAdapter;
