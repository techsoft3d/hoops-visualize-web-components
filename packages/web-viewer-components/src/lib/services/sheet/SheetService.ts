import { Color, SheetManager } from '@ts3d-hoops/web-viewer';
import { ISheetService, isSheetServiceConfiguration, SheetServiceConfiguration } from './types';

export default class SheetService extends EventTarget implements ISheetService {
  public readonly serviceName = 'SheetService' as const;

  private _sheetManager?: SheetManager = undefined;

  public static readonly DefaultConfiguration: SheetServiceConfiguration = {
    backgroundColor: '#b4b4b4',
    sheetColor: '#ffffff',
    sheetShadowColor: '#4b4b4b',
    backgroundSheetEnabled: false,
  };

  get sheetManager(): SheetManager | undefined {
    return this._sheetManager;
  }

  set sheetManager(sheetManager: SheetManager | undefined) {
    if (this._sheetManager === sheetManager) {
      return;
    }
    this._sheetManager = sheetManager;
    this.dispatchEvent(
      new CustomEvent('hoops-sheet-service-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  getSheetBackgroundColor(): string {
    if (!this.sheetManager) {
      return SheetService.DefaultConfiguration.backgroundColor;
    }
    return this.sheetManager.getSheetBackgroundColor().toHexString();
  }

  getSheetColor(): string {
    if (!this.sheetManager) {
      return SheetService.DefaultConfiguration.sheetColor;
    }
    return this.sheetManager.getSheetColor().toHexString();
  }

  getSheetShadowColor(): string {
    if (!this.sheetManager) {
      return SheetService.DefaultConfiguration.sheetShadowColor;
    }
    return this.sheetManager.getSheetShadowColor().toHexString();
  }

  async setSheetColors(
    backgroundColor: string,
    sheetColor: string,
    sheetShadowColor: string,
  ): Promise<void> {
    if (!this.sheetManager) {
      throw new Error('SheetManager is not set');
    }
    await this.sheetManager.setSheetColors(
      Color.fromHexString(backgroundColor),
      Color.fromHexString(sheetColor),
      Color.fromHexString(sheetShadowColor),
    );
    this.dispatchEvent(
      new CustomEvent('hoops-sheet-colors-changed', {
        detail: {
          backgroundColor,
          sheetColor,
          sheetShadowColor,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  getBackgroundSheetEnabled(): boolean {
    if (!this.sheetManager) {
      return false;
    }
    return this.sheetManager.getBackgroundSheetEnabled();
  }

  async setBackgroundSheetEnabled(enabled: boolean): Promise<void> {
    if (!this.sheetManager) {
      throw new Error('SheetManager is not set');
    }
    await this.sheetManager.setBackgroundSheetEnabled(enabled);
    this.dispatchEvent(
      new CustomEvent('hoops-background-sheet-enabled-changed', {
        detail: enabled,
        bubbles: true,
        composed: true,
      }),
    );
  }

  async resetConfiguration(obj?: object): Promise<void> {
    const config = obj ?? SheetService.DefaultConfiguration;
    if (!this.sheetManager) {
      throw new Error('SheetManager is not set');
    }

    if (!isSheetServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    await this.setSheetColors(config.backgroundColor, config.sheetColor, config.sheetShadowColor);
    await this.setBackgroundSheetEnabled(config.backgroundSheetEnabled);
  }
}
