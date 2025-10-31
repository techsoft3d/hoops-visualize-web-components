import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import {
  tryGetService,
  CuttingService,
  getService,
  type ICuttingService,
  type ICameraService,
  type IExplodeService,
  type IRedlineService,
  type IRenderOptionsService,
  type IPmiService,
  type ISelectionService,
  type ISheetService,
  type ISpaceMouseService,
  type IWalkOperatorService,
  IService,
  RedlineService,
  registerService,
  RenderOptionsService,
  SelectionService,
  ServiceName,
  IFCRelationshipsService,
  PmiService,
  CameraService,
  SheetService,
  WalkOperatorService,
  ExplodeService,
  SpaceMouseService,
} from '../services';
import NoteTextService, { type INoteTextService } from '../services/notetext';
import MeasurementService from '../services/measurement/MeasurementService';
import { type IMeasurementService } from '../services/measurement';
import { type IIFCRelationshipsService } from '../services/ifc-relationships/types';
import { type IViewService } from '../services/view/types';
import ViewService from '../services/view/ViewService';
import FloorplanService, { type IFloorplanService } from '../services/floorplan';

/**
 * HoopsServiceRegistryElement is a LitElement that registers the default services.
 * This component is used to ensure that the services are available throughout the application.
 * It is an helper component, since the services can be registered manually as well.
 *
 * The services can be overridden by passing a different service instance to the properties of the
 * element.
 *
 * @export
 * @class HoopsServiceRegistry
 * @typedef {HoopsServiceRegistry}
 * @extends {LitElement}
 */
@customElement('hoops-service-registry')
export class HoopsServiceRegistryElement extends LitElement {
  @property({ type: Object, attribute: false })
  public redlineService: IRedlineService = new RedlineService();

  @property({ type: Object, attribute: false })
  public noteTextService: INoteTextService = new NoteTextService();

  @property({ type: Object, attribute: false })
  public measurementService: IMeasurementService = new MeasurementService();

  @property({ type: Object, attribute: false })
  public renderOptionsService: IRenderOptionsService = new RenderOptionsService();

  @property({ type: Object, attribute: false })
  public viewService: IViewService = new ViewService();

  @property({ type: Object, attribute: false })
  public ifcRelationshipsService: IIFCRelationshipsService = new IFCRelationshipsService();

  @property({ type: Object, attribute: false })
  public floorplanService: IFloorplanService = new FloorplanService();

  @property({ type: Object, attribute: false })
  public pmiService: IPmiService = new PmiService();

  @property({ type: Object, attribute: false })
  public selectionService: ISelectionService = new SelectionService();

  @property({ type: Object, attribute: false })
  public cuttingService: ICuttingService = new CuttingService();

  @property({ type: Object, attribute: false })
  public cameraService: ICameraService = new CameraService();

  @property({ type: Object, attribute: false })
  public sheetService: ISheetService = new SheetService();

  @property({ type: Object, attribute: false })
  public walkOperatorService: IWalkOperatorService = new WalkOperatorService();

  @property({ type: Object, attribute: false })
  public explodeService: IExplodeService = new ExplodeService();

  @property({ type: Object, attribute: false })
  public spaceMouseService: ISpaceMouseService = new SpaceMouseService();

  connectedCallback(): void {
    super.connectedCallback();

    registerService(this.measurementService);
    registerService(this.redlineService);
    registerService(this.noteTextService);
    registerService(this.renderOptionsService);
    registerService(this.ifcRelationshipsService);
    registerService(this.viewService);
    registerService(this.floorplanService);
    registerService(this.pmiService);
    registerService(this.selectionService);
    registerService(this.cuttingService);
    registerService(this.cameraService);
    registerService(this.sheetService);
    registerService(this.walkOperatorService);
    registerService(this.explodeService);
    registerService(this.spaceMouseService);
  }

  public getService<T extends IService = IService>(serviceName: ServiceName): T {
    return getService<T>(serviceName);
  }

  public tryGetService<T extends IService = IService>(serviceName: ServiceName): T | undefined {
    return tryGetService<T>(serviceName);
  }

  protected createRenderRoot() {
    return this;
  }

  protected override render(): unknown {
    return html``;
  }
}

export default HoopsServiceRegistryElement;
