import { Operators } from '@ts3d-hoops/web-viewer';
import { OperatorId, Operators } from '@ts3d-hoops/web-viewer';

export type MeasurementToolSelectedEvent = CustomEvent<{ operator: OperatorId }>;
export type MeasurementRemoveCommand = CustomEvent<{
  measurement: Operators.Markup.Measure.MeasureMarkup;
}>;

declare global {
  interface CustomEventMap {
    'measurement-tool-selected': MeasurementToolSelectedEvent;
    'hoops-measurement-remove-command': MeasurementRemoveCommand;
  }
}

export {};
