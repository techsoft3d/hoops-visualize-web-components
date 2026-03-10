import { IMaterial } from '@ts3d-hoops/web-viewer';
import { IService } from '../types';
import { SetShaderOptions } from '@ts3d-hoops/streamcache';

export type MeshDataElementDescription = {
  vertexCount: number;
  hasNormals: boolean;
  hasUVs: boolean;
  hasRGBAs: boolean;
  elementCount: number;
};

export type MeshDescription = {
  /**
   * Provides access to the mesh's face data.
   */
  faces: MeshDataElementDescription;

  /**
   * Provides access to the mesh's line data. Line data is represented as a list of individual line segments and not polylines.
   */
  lines: MeshDataElementDescription;

  /**
   * Provides access to the mesh's point data.
   */
  points: MeshDataElementDescription;

  /**
   * Whether or not the mesh data is two-sided. Backface culling is disabled for two-sided meshes.
   */
  isTwoSided: boolean;

  /**
   * Whether or not the mesh data is manifold. Cutting section caps are generated only for manifold objects.
   */
  isManifold: boolean;

  /**
   * The order in which the vertices of each face are specified. This determines which side of the face is the front.
   * May be `undefined`.
   */
  winding?: 'clockwise' | 'counterClockwise';
};

export interface IMaterialService extends IService {
  getSelectedNodeIds(): number[];
  getMeshDescription(nodeId: number): Promise<MeshDescription | undefined>;
  getMaterialDescription(nodeId: number): Promise<IMaterial | undefined>;
  setNodesShader(
    nodeIds: number[],
    vertexShader: string,
    fragmentShader: string,
    options?: SetShaderOptions,
  ): Promise<void>;
}
