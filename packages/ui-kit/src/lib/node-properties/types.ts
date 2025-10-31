import { HTMLTemplateResult } from 'lit';

/**
 * This type is used as the interface to get the properties for the nodes and allow overriding.
 *
 * @export
 * @interface INodePropertyAdapter
 * @typedef {INodePropertyAdapter}
 */
export interface INodePropertyAdapter {
  getNodeName(nodeId: number): string;
  getProperties(nodeId: number): Promise<[string, string][]>;
  getUserData(nodeId: number): Promise<[string, string][]>;

  formatProperty?: (key: string, value: string) => [HTMLTemplateResult, HTMLTemplateResult];
  formatUserData?: (key: string, value: string) => [HTMLTemplateResult, HTMLTemplateResult];
}

/**
 * This type is used to define the interface that corresponds to the @ts3d-hoops/web-viewer Model class.
 * The point is to avoid having a strong dependency between the web-viewer and the UI kit.
 * Any object that implements these APIs can be used as the data source for the NodePropertyAdapter
 *
 * @export
 * @interface IModel
 * @typedef {IModel}
 */
export interface IModel {
  getNodeName: (nodeId: number) => string | null;
  getNodeProperties(
    nodeId: number,
    computeFromChildren?: boolean,
  ): Promise<Record<string, string | undefined> | null>;
  getNodeUserDataIndices(nodeId: number): (number | string)[];
  getNodeUserData(nodeId: number, index: number | string): Uint8Array;
}
