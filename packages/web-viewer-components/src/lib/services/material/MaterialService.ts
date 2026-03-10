import { CallbackMap, core, IMaterial } from '@ts3d-hoops/web-viewer';
import { MeshDescription, type IMaterialService } from './types';
import { SetShaderOptions } from '@ts3d-hoops/streamcache';

export class MaterialService extends EventTarget implements IMaterialService {
  public readonly serviceName = 'MaterialService' as const;

  private _viewer?: core.IWebViewer;

  private selectedNodeIds: number[] = [];

  /** Callback map for HOOPS Web Viewer events. */
  private callbackMap: CallbackMap;

  constructor(viewer?: core.IWebViewer) {
    super();
    this._viewer = viewer;

    this.callbackMap = {
      selectionArray: () => {
        this.selectedNodeIds =
          this._viewer?.selectionManager.getResults().map((s) => s.getNodeId()) || [];

        this.dispatchEvent(
          new CustomEvent('hoops-material-selection-change', {
            bubbles: true,
            composed: true,
          }),
        );
      },
    };
    if (this._viewer) {
      this.bind();
    }
  }

  private bind(): void {
    if (!this._viewer) {
      throw new Error('Viewer not set');
    }

    this._viewer.setCallbacks(this.callbackMap);
  }

  private unbind(): void {
    if (!this._viewer) {
      throw new Error('Viewer not set');
    }

    this._viewer.unsetCallbacks(this.callbackMap);
  }

  get viewer(): core.IWebViewer | undefined {
    return this._viewer;
  }

  set viewer(viewer: core.IWebViewer | undefined) {
    if (this._viewer === viewer) {
      return;
    }

    if (this._viewer) {
      this.unbind();
    }

    this._viewer = viewer;
    if (this._viewer) {
      this.bind();
    }

    this.dispatchEvent(
      new CustomEvent('hoops-model-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  getSelectedNodeIds(): number[] {
    return this.selectedNodeIds;
  }

  async getMeshDescription(nodeId: number): Promise<MeshDescription | undefined> {
    if (!this._viewer) {
      return undefined;
    }

    const data = (await this._viewer.model.getNodeMeshData(nodeId)) satisfies
      | MeshDescription
      | undefined;
    return data;
  }

  async getMaterialDescription(nodeId: number): Promise<IMaterial | undefined> {
    if (!this._viewer) {
      return undefined;
    }

    const materials = await this._viewer.model.getNodesMaterial([nodeId]);
    return materials?.length ? materials[0] : undefined;
  }

  async setNodesShader(
    nodeIds: number[],
    vertexShader: string,
    fragmentShader: string,
    options?: SetShaderOptions,
  ): Promise<void> {
    if (!this._viewer) {
      throw new Error('Viewer not set');
    }

    return this._viewer.model.setNodesShader(nodeIds, vertexShader, fragmentShader, options);
  }
}

export default MaterialService;
