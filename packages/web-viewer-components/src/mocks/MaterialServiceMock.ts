import { Color, IMaterial } from '@ts3d-hoops/web-viewer';
import { IMaterialService, MeshDescription } from '../lib/services/material/types';
import { SetShaderOptions } from '@ts3d-hoops/streamcache';

const defaultMeshDescription: MeshDescription = {
  faces: {
    vertexCount: 36,
    hasNormals: true,
    hasUVs: false,
    hasRGBAs: false,
    elementCount: 12,
  },
  lines: {
    vertexCount: 0,
    hasNormals: false,
    hasUVs: false,
    hasRGBAs: false,
    elementCount: 0,
  },
  points: {
    vertexCount: 0,
    hasNormals: false,
    hasUVs: false,
    hasRGBAs: false,
    elementCount: 0,
  },
  isTwoSided: false,
  isManifold: true,
  winding: 'counterClockwise',
};

const defaultMaterial: IMaterial = {
  faceColor: new Color(0.1, 0.2, 0.3),
  lineColor: new Color(0.1, 0.2, 0.3),
  specularColor: new Color(0.1, 0.2, 0.3),
  ambientColor: new Color(0.1, 0.2, 0.3),
  emissiveColor: new Color(0.1, 0.2, 0.3),
};

export class MaterialServiceMock extends EventTarget implements IMaterialService {
  public readonly serviceName = 'MaterialService' as const;

  private selectedNodeIds: number[] = [];
  private nodeShaders: Map<number, { vertexShader: string; fragmentShader: string }> = new Map();
  private nodeMeshes: Map<number, MeshDescription> = new Map();
  private nodeMaterials: Map<number, IMaterial> = new Map();

  public fn: (...args: any[]) => any;

  public getSelectedNodeIds: () => number[];
  public getMeshDescription: (nodeId: number) => Promise<MeshDescription | undefined>;
  public getMaterialDescription: (nodeId: number) => Promise<IMaterial | undefined>;
  public setNodesShader: (
    nodeIds: number[],
    vertexShader: string,
    fragmentShader: string,
    options?: SetShaderOptions,
  ) => Promise<void>;
  public reset: () => void;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    // getSelectedNodeIds getter
    this.getSelectedNodeIds = fn(() => this.selectedNodeIds);

    // getMeshDescription - returns promise with mesh data or undefined
    this.getMeshDescription = fn(async (nodeId: number): Promise<MeshDescription | undefined> => {
      if (this.nodeMeshes.has(nodeId)) {
        return this.nodeMeshes.get(nodeId);
      }
      // Return default mesh if not specifically set
      return structuredClone(defaultMeshDescription);
    });

    // getMaterialDescription - returns promise with material data or undefined
    this.getMaterialDescription = fn(async (nodeId: number): Promise<IMaterial | undefined> => {
      if (this.nodeMaterials.has(nodeId)) {
        return this.nodeMaterials.get(nodeId);
      }
      // Return default material if not specifically set
      return structuredClone(defaultMaterial);
    });

    // setNodesShader - sets shaders for nodes and dispatches event
    this.setNodesShader = fn(
      async (
        nodeIds: number[],
        vertexShader: string,
        fragmentShader: string,
        options?: SetShaderOptions,
      ): Promise<void> => {
        for (const nodeId of nodeIds) {
          this.nodeShaders.set(nodeId, { vertexShader, fragmentShader });
        }

        this.dispatchEvent(
          new CustomEvent('hoops-material-updated', {
            bubbles: true,
            composed: true,
            detail: { nodeIds, vertexShader, fragmentShader, options },
          }),
        );
      },
    );

    // reset - clears all shaders and node data
    this.reset = fn(() => {
      this.nodeShaders.clear();
      this.nodeMeshes.clear();
      this.nodeMaterials.clear();
      this.selectedNodeIds = [];

      this.dispatchEvent(
        new CustomEvent('hoops-material-service-reset', {
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  /**
   * Simulates a selection change by updating the selected node IDs
   * and dispatching a selection change event.
   */
  public simulateSelectionChange(nodeIds: number[]): void {
    this.selectedNodeIds = nodeIds;

    this.dispatchEvent(
      new CustomEvent('hoops-material-selection-change', {
        bubbles: true,
        composed: true,
        detail: { selectedNodeIds: nodeIds },
      }),
    );
  }

  /**
   * Sets custom mesh description for a specific node.
   */
  public setNodeMeshDescription(nodeId: number, mesh: MeshDescription): void {
    this.nodeMeshes.set(nodeId, structuredClone(mesh));
  }

  /**
   * Sets custom material description for a specific node.
   */
  public setNodeMaterialDescription(nodeId: number, material: IMaterial): void {
    this.nodeMaterials.set(nodeId, structuredClone(material));
  }

  /**
   * Gets the shader currently applied to a node.
   */
  public getNodeShader(
    nodeId: number,
  ): { vertexShader: string; fragmentShader: string } | undefined {
    return this.nodeShaders.get(nodeId);
  }

  /**
   * Clears shaders for specific nodes.
   */
  public clearNodesShader(nodeIds: number[]): void {
    for (const nodeId of nodeIds) {
      this.nodeShaders.delete(nodeId);
    }
  }
}

export default MaterialServiceMock;
