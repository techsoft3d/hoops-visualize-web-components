import { Task, TaskFunctionOptions } from '@lit/task';
import { LitElement, html, css, HTMLTemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { INodePropertyAdapter } from './types';
import { componentBaseStyle } from '../css-common';
import NodePropertyAdapter from './NodePropertyAdapter';

/**
 * This class implements the hoops-node-properties
 *
 * @export
 * @class NodeProperties
 * @typedef {NodeProperties}
 * @extends {LitElement}
 */
@customElement('hoops-node-properties')
export class NodeProperties extends LitElement {
  static styles = [
    componentBaseStyle,
    css`
      table {
        width: 100%;
        margin-bottom: 1rem;
      }

      table,
      th,
      tr,
      td {
        border-collapse: collapse;
        border: solid 1px black;
      }

      h3 {
        padding: 0.25rem;
        margin: 0;
      }

      .field-name,
      .field-value {
        min-width: 8rem;
        word-break: break-word;
        text-overflow: ellipsis;
      }

      .field-value {
        width: 80%;
      }

      th,
      .field-name,
      .field-value {
        padding: 0.5rem 0.5rem;
      }
    `,
  ];

  /**
   * This property represents the id node we want to display the properties from
   *
   * @type {number}
   */
  @property({ type: Number })
  nodeId = Number.NaN;

  /**
   * This state variable will hold the API to access the node's information.
   *
   * The default type of this variable is NodePropertyAdapter but it can be
   * overridden for customization purposes. It accepts anything implementing the
   * INodePropertyAdapter interface.
   *
   * @type {INodePropertyAdapter}
   */
  @state()
  node = new NodePropertyAdapter() as INodePropertyAdapter;

  private loadDataTask = new Task<
    [number, INodePropertyAdapter],
    { name: string; properties: [string, string][]; userData: [string, string][] }
  >(
    this,
    async ([nodeId, node], options: TaskFunctionOptions) => {
      const result = {
        name: node.getNodeName(nodeId),
        properties: await node.getProperties(nodeId),
        userData: await node.getUserData(nodeId),
      };

      options.signal.throwIfAborted();
      return result;
    },
    () => [this.nodeId, this.node],
  );

  /**
   * This function generates a table to display the properties within two
   * columns, the name and the value.
   *
   * @private
   * @param {[string, string][]} rows
   * @param {?(input: string) => HTMLTemplateResult} [formatter]
   * @returns {HTMLTemplateResult) => any}
   */
  private generateTable(
    rows: [string, string][],
    formatter?: (input: string) => HTMLTemplateResult,
  ) {
    if (rows.length === 0) {
      return nothing;
    }

    return html`
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${repeat(rows, ([key, value]) => {
            return html`<tr>
              <td class="field-name">${key}</td>
              <td class="field-value">${formatter ? formatter(value) : value}</td>
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }

  render() {
    if (Number.isNaN(this.nodeId)) {
      return html`<div>No properties to display</div>`;
    }

    return this.loadDataTask.render({
      pending: () => html`<p>Loading data</p>`,
      complete: (result) => {
        const userData = result.userData;
        return html`
          <section class="property-window">
            <div class="property-table">
              <h3>Properties</h3>
              ${this.generateTable([
                ['Name', result.name],
                ['ID', this.nodeId.toString()],
                ...result.properties,
              ])}
            </div>

            ${userData.length
              ? html`<div class="user-data-table">
                  <h3>User Data</h3>
                  ${this.generateTable([...result.userData])}
                </div>`
              : nothing}
          </section>
        `;
      },
      error: (e) => html`<p>Error: ${e}</p>`,
    });
  }
}

export default NodeProperties;
