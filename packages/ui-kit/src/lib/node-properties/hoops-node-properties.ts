import { Task, TaskFunctionOptions } from '@lit/task';
import { LitElement, html, css, HTMLTemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { INodePropertyAdapter } from './types';
import { componentBaseStyle } from '../css-common';
import NodePropertyAdapter from './NodePropertyAdapter';

/**
 * A web component that displays properties and user data for a selected node in a tabular format.
 *
 * The component fetches and renders node information including the node name, ID, properties,
 * and associated user data in organized tables.
 *
 * @element hoops-node-properties
 *
 * @cssprop --hoops-node-properties-table-border - Border style for property tables
 * @cssprop --hoops-node-properties-header-padding - Padding for table headers
 *
 * @attribute {number} nodeId - The ID of the node to display properties for
 *
 * @example
 * ```html
 * <hoops-node-properties nodeId="12345"></hoops-node-properties>
 * ```
 *
 * @since 2025.7.0
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
   * The ID of the node to display properties for.
   *
   * @default Number.NaN
   */
  @property({ type: Number })
  nodeId = Number.NaN;

  /**
   * The adapter instance used to fetch node data.
   *
   * Can be customized by providing any object implementing the INodePropertyAdapter interface.
   *
   * @default new NodePropertyAdapter()
   */
  @state()
  node = new NodePropertyAdapter() as INodePropertyAdapter;

  /** @internal */
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
   * Generates a table HTML template to display property data in a two-column format.
   *
   * @param rows - Array of key-value pairs to display in the table
   * @param formatter - Optional function to format the value column content
   * @returns HTML template for the table or nothing if rows array is empty
   *
   * @internal
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

  /**
   * Renders the component's template.
   *
   * @returns HTML template for the node properties display
   *
   * @internal
   */
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
