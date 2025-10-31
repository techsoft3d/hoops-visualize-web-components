import { CallbackMap, Color, MeasureManager } from '@ts3d-hoops/web-viewer';
import { IMeasurementService, isMeasurementServiceConfiguration } from './types';
import { Operators } from '@ts3d-hoops/web-viewer';

type MeasureMarkup = Operators.Markup.Measure.MeasureMarkup;

export default class MeasurementService extends EventTarget implements IMeasurementService {
  public readonly serviceName = 'MeasurementService' as const;

  private _measureManager?: MeasureManager;

  private callbackMap: CallbackMap = {};

  public static readonly DefaultConfig = {
    color: '#000000',
  };

  constructor(measureManager?: MeasureManager) {
    super();
    this._measureManager = measureManager;

    this.callbackMap = {
      measurementCreated: this.callbackToEvent('hoops-measurement-updated').bind(this),
      measurementDeleted: this.callbackToEvent('hoops-measurement-updated').bind(this),
    };
    if (this._measureManager) {
      this.bind();
    }
  }

  private callbackToEvent = (eventName: string) => {
    return () => {
      if (!this._measureManager) {
        return;
      }
      this.dispatchEvent(
        new CustomEvent(eventName, {
          bubbles: true,
          composed: true,
          detail: {
            measurements: this.measurements,
          },
        }),
      );
    };
  };

  private unbind() {
    if (this._measureManager) {
      // Clear callbacks by setting empty callbacks
      this._measureManager.viewer.setCallbacks({});
    }
  }

  private bind() {
    if (!this._measureManager) {
      throw new Error('MarkupManager is not set');
    }

    this._measureManager.viewer.setCallbacks(this.callbackMap);
  }

  removeMeasurement(measurement: MeasureMarkup): void {
    this._measureManager?.removeMeasurement(measurement);
  }

  get measurements(): MeasureMarkup[] {
    if (!this._measureManager) {
      return [];
    }
    const allMeasurements = this._measureManager.getAllMeasurements();
    return allMeasurements || [];
  }

  public get measureManager(): MeasureManager | undefined {
    return this._measureManager;
  }

  public set measureManager(value: MeasureManager) {
    // Don't rebind if it's the same manager
    if (this._measureManager === value) {
      return;
    }

    // Unbind from old manager first
    this.unbind();

    // Store the new manager and bind callbacks
    this._measureManager = value;
    this.bind();
  }

  getMeasurementColor(): string {
    if (!this._measureManager) {
      return MeasurementService.DefaultConfig.color;
    }
    return this._measureManager.getMeasurementColor().toHexString();
  }

  setMeasurementColor(color: string): void {
    if (!this._measureManager) {
      throw new Error('MeasureManager is not set');
    }
    this._measureManager.setMeasurementColor(Color.fromHexString(color));
    this.dispatchEvent(
      new CustomEvent('hoops-measurement-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  async resetConfiguration(obj?: object): Promise<void> {
    if (!this._measureManager) {
      throw new Error('MeasureManager is not set');
    }

    const config = obj ?? MeasurementService.DefaultConfig;

    if (!isMeasurementServiceConfiguration(config)) {
      throw new Error('Invalid configuration object');
    }

    this._measureManager.removeAllMeasurements();
    this.setMeasurementColor(config.color);

    this.dispatchEvent(
      new CustomEvent('hoops-measurement-reset', {
        bubbles: true,
        composed: true,
        detail: {
          measurements: this.measurements,
        },
      }),
    );
  }
}
