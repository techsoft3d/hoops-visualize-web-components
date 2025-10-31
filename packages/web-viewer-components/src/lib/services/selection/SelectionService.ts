import { Color, core, OperatorId, SelectionMask } from '@ts3d-hoops/web-viewer';
import { ISelectionService, isSelectionServiceConfiguration } from './types';

export default class SelectionService extends EventTarget implements ISelectionService {
  public readonly serviceName = 'SelectionService' as const;

  public static readonly DefaultConfiguration = {
    faceLineSelectionEnabled: true,
    honorsSceneVisibility: true,
    bodyColor: '#ffff00',
    faceAndLineColor: '#ff0000',
  };

  private _webviewer?: core.IWebViewer;

  public get webViewer(): core.IWebViewer | undefined {
    return this._webviewer;
  }

  public set webViewer(value: core.IWebViewer | undefined) {
    if (this._webviewer === value) {
      return;
    }

    this._webviewer = value;
    this.dispatchEvent(
      new CustomEvent('hoops-selection-service-reset', { bubbles: true, composed: true }),
    );
  }

  public getEnableFaceLineSelection(): boolean {
    if (!this._webviewer) {
      return SelectionService.DefaultConfiguration.faceLineSelectionEnabled;
    }

    return (
      this._webviewer.selectionManager.getHighlightFaceElementSelection() &&
      this._webviewer.selectionManager.getHighlightLineElementSelection()
    );
  }

  public async setEnableFaceLineSelection(enableFaceLineSelection: boolean): Promise<void> {
    if (!this._webviewer) {
      return Promise.reject(new Error('Webviewer not set'));
    }

    await this._webviewer.selectionManager.setHighlightFaceElementSelection(
      enableFaceLineSelection,
    );
    await this._webviewer.selectionManager.setHighlightLineElementSelection(
      enableFaceLineSelection,
    );

    this.dispatchEvent(
      new CustomEvent('hoops-enable-face-line-selection-changed', {
        bubbles: true,
        composed: true,
        detail: enableFaceLineSelection,
      }),
    );
  }

  public getHonorsSceneVisibility(): boolean {
    if (!this._webviewer) {
      return SelectionService.DefaultConfiguration.honorsSceneVisibility;
    }

    const selectionOperator = this._webviewer.operatorManager.getOperator(OperatorId.Select);
    const selectionOperatorPickConfig = selectionOperator.getPickConfig();
    const forceEffectiveSceneVisibilityMask =
      selectionOperatorPickConfig.forceEffectiveSceneVisibilityMask;
    return forceEffectiveSceneVisibilityMask == SelectionMask.None;
  }

  public setHonorsSceneVisibility(honorsSceneVisibility: boolean): void {
    if (!this._webviewer) {
      throw new Error('Webviewer not set');
    }

    const forceEffectiveSceneVisibilityMask = honorsSceneVisibility
      ? SelectionMask.None
      : SelectionMask.All;

    const selectionOperator = this._webviewer.operatorManager.getOperator(OperatorId.Select);
    const selectionOperatorPickConfig = selectionOperator.getPickConfig();
    selectionOperatorPickConfig.forceEffectiveSceneVisibilityMask =
      forceEffectiveSceneVisibilityMask;
    selectionOperator.setPickConfig(selectionOperatorPickConfig);

    const areaSelectionOperator = this._webviewer.operatorManager.getOperator(
      OperatorId.AreaSelect,
    );
    areaSelectionOperator.setForceEffectiveSceneVisibilityMask(forceEffectiveSceneVisibilityMask);

    const rayDrillSelectionOperator = this._webviewer.operatorManager.getOperator(
      OperatorId.RayDrillSelect,
    );
    rayDrillSelectionOperator.setForceEffectiveSceneVisibilityMask(
      forceEffectiveSceneVisibilityMask,
    );

    this.dispatchEvent(
      new CustomEvent('hoops-honors-scene-visibility-changed', {
        bubbles: true,
        composed: true,
        detail: honorsSceneVisibility,
      }),
    );
  }

  public getBodyColor(): string {
    if (!this._webviewer) {
      return SelectionService.DefaultConfiguration.bodyColor;
    }

    return this._webviewer.selectionManager.getNodeSelectionColor().toHexString();
  }

  public async setBodyColor(color: string): Promise<void> {
    if (!this._webviewer) {
      throw new Error('Webviewer not set');
    }

    await this._webviewer.selectionManager.setNodeSelectionColor(Color.fromHexString(color));
    await this._webviewer.selectionManager.setNodeSelectionOutlineColor(Color.fromHexString(color));

    this.dispatchEvent(
      new CustomEvent('hoops-body-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  public getFaceAndLineColor(): string {
    if (!this._webviewer) {
      return SelectionService.DefaultConfiguration.faceAndLineColor;
    }

    return this._webviewer.selectionManager.getNodeElementSelectionColor().toHexString();
  }

  public async setFaceAndLineColor(color: string): Promise<void> {
    if (!this._webviewer) {
      throw new Error('Webviewer not set');
    }

    await this._webviewer.selectionManager.setNodeElementSelectionColor(Color.fromHexString(color));
    await this._webviewer.selectionManager.setNodeElementSelectionOutlineColor(
      Color.fromHexString(color),
    );

    this.dispatchEvent(
      new CustomEvent('hoops-face-and-line-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  public async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? SelectionService.DefaultConfiguration;

    if (!isSelectionServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    if (!this._webviewer) {
      throw new Error('Webviewer not set');
    }

    this.setEnableFaceLineSelection(config.faceLineSelectionEnabled);
    this.setHonorsSceneVisibility(config.honorsSceneVisibility);
    this.setBodyColor(config.bodyColor);
    this.setFaceAndLineColor(config.faceAndLineColor);
  }
}
