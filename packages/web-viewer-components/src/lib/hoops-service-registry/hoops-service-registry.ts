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
 * HoopsServiceRegistryElement is a LitElement-based web component that provides centralized
 * service registration and management for the Hoops web viewer application.
 *
 * This component acts as a dependency injection container, automatically registering all core
 * services when connected to the DOM. It provides a convenient way to bootstrap the entire
 * service ecosystem with sensible defaults while allowing for easy customization.
 *
 * ## Features:
 * - Automatic registration of all core services
 * - Service customization through properties
 * - Type-safe service retrieval methods
 * - Zero-configuration setup with sensible defaults
 * - Service locator pattern implementation
 *
 * @element hoops-service-registry
 *
 * @example
 * ```html
 * <hoops-service-registry></hoops-service-registry>
 *
 * <script>
 *   const measurementService = document.getElementsByTagName('hoops-service-registry')[0].getService('MeasurementService');
 * </script>
 * ```
 * @since 2025.8.0
 */
@customElement('hoops-service-registry')
export class HoopsServiceRegistryElement extends LitElement {
  /**
   * Service for managing redline markup and annotations.
   * Handles creation, editing, and persistence of redline elements.
   * @type {IRedlineService}
   * @default new RedlineService()
   */
  @property({ type: Object, attribute: false })
  public redlineService: IRedlineService = new RedlineService();

  /**
   * Service for managing text notes and comments.
   * Provides functionality for adding, editing, and organizing textual annotations.
   * @type {INoteTextService}
   * @default new NoteTextService()
   */
  @property({ type: Object, attribute: false })
  public noteTextService: INoteTextService = new NoteTextService();

  /**
   * Service for handling measurement tools and calculations.
   * Supports distance, angle, area, and volume measurements.
   * @type {IMeasurementService}
   * @default new MeasurementService()
   */
  @property({ type: Object, attribute: false })
  public measurementService: IMeasurementService = new MeasurementService();

  /**
   * Service for controlling rendering settings and visual options.
   * Manages display modes, lighting, materials, and other rendering parameters.
   * @type {IRenderOptionsService}
   * @default new RenderOptionsService()
   */
  @property({ type: Object, attribute: false })
  public renderOptionsService: IRenderOptionsService = new RenderOptionsService();

  /**
   * Service for handling view management and navigation.
   * Controls camera positions, view states, and navigation modes.
   * @type {IViewService}
   * @default new ViewService()
   */
  @property({ type: Object, attribute: false })
  public viewService: IViewService = new ViewService();

  /**
   * Service for managing IFC (Industry Foundation Classes) model relationships.
   * Handles building information modeling data and relationships between elements.
   * @type {IIFCRelationshipsService}
   * @default new IFCRelationshipsService()
   */
  @property({ type: Object, attribute: false })
  public ifcRelationshipsService: IIFCRelationshipsService = new IFCRelationshipsService();

  /**
   * Service for managing floorplan functionality and 2D representations.
   * Provides tools for working with architectural floor plans and layouts.
   * @type {IFloorplanService}
   * @default new FloorplanService()
   */
  @property({ type: Object, attribute: false })
  public floorplanService: IFloorplanService = new FloorplanService();

  /**
   * Service for handling Product Manufacturing Information (PMI).
   * Manages annotations, dimensions, tolerances, and other manufacturing data.
   * @type {IPmiService}
   * @default new PmiService()
   */
  @property({ type: Object, attribute: false })
  public pmiService: IPmiService = new PmiService();

  /**
   * Service for managing object selection and highlighting.
   * Handles single and multi-selection, selection events, and highlight visualization.
   * @type {ISelectionService}
   * @default new SelectionService()
   */
  @property({ type: Object, attribute: false })
  public selectionService: ISelectionService = new SelectionService();

  /**
   * Service for providing cutting plane functionality.
   * Enables sectioning of 3D models with interactive cutting planes.
   * @type {ICuttingService}
   * @default new CuttingService()
   */
  @property({ type: Object, attribute: false })
  public cuttingService: ICuttingService = new CuttingService();

  /**
   * Service for controlling camera movement and positioning.
   * Manages camera animations, transitions, and view manipulations.
   * @type {ICameraService}
   * @default new CameraService()
   */
  @property({ type: Object, attribute: false })
  public cameraService: ICameraService = new CameraService();

  /**
   * Service for managing drawing sheets and layouts.
   * Handles 2D technical drawings, sheet navigation, and layout management.
   * @type {ISheetService}
   * @default new SheetService()
   */
  @property({ type: Object, attribute: false })
  public sheetService: ISheetService = new SheetService();

  /**
   * Service for handling walk-through navigation mode.
   * Provides first-person navigation experience for architectural models.
   * @type {IWalkOperatorService}
   * @default new WalkOperatorService()
   */
  @property({ type: Object, attribute: false })
  public walkOperatorService: IWalkOperatorService = new WalkOperatorService();

  /**
   * Service for providing assembly explosion functionality.
   * Enables visual separation of assembly components for better understanding.
   * @type {IExplodeService}
   * @default new ExplodeService()
   */
  @property({ type: Object, attribute: false })
  public explodeService: IExplodeService = new ExplodeService();

  /**
   * Service for integrating 3D SpaceMouse navigation devices.
   * Provides support for professional 3D input devices for enhanced navigation.
   * @type {ISpaceMouseService}
   * @default new SpaceMouseService()
   */
  @property({ type: Object, attribute: false })
  public spaceMouseService: ISpaceMouseService = new SpaceMouseService();

  /**
   * Lifecycle callback invoked when the element is connected to the DOM.
   * Automatically registers all configured services in the global service registry,
   * making them available throughout the application.
   *
   * Services are registered in a specific order to handle any potential dependencies.
   * If a service with the same name already exists, it will be overwritten with a warning.
   *
   * @override
   * @returns {void}
   */
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

  /**
   * Retrieves a service from the global service registry by its name.
   * This is a type-safe wrapper around the global getService function.
   *
   * @template T - The type of the service to retrieve, must extend IService
   * @param {ServiceName} serviceName - The unique name of the service to retrieve
   * @returns {T} The requested service instance
   * @throws {Error} If the service with the given name is not registered
   *
   * @example
   * ```typescript
   * const measurementService = registry.getService<IMeasurementService>('MeasurementService');
   * measurementService.startMeasurement();
   * ```
   */
  public getService<T extends IService = IService>(serviceName: ServiceName): T {
    return getService<T>(serviceName);
  }

  /**
   * Attempts to retrieve a service from the global service registry by its name.
   * Returns undefined if the service is not found, making it safe for optional services.
   *
   * @template T - The type of the service to retrieve, must extend IService
   * @param {ServiceName} serviceName - The unique name of the service to retrieve
   * @returns {T | undefined} The service instance if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const customService = registry.tryGetService<ICustomService>('CustomService');
   * if (customService) {
   *   customService.performCustomAction();
   * }
   * ```
   */
  public tryGetService<T extends IService = IService>(serviceName: ServiceName): T | undefined {
    return tryGetService<T>(serviceName);
  }

  /**
   * Returns the element itself as the render root instead of creating a shadow DOM.
   * This ensures the component doesn't interfere with the application's styling and DOM structure.
   *
   * @internal
   * @protected
   * @override
   * @returns {Element} The element itself
   */
  protected createRenderRoot() {
    return this;
  }

  /**
   * Renders an empty template since this component is purely functional.
   * The component's purpose is service registration, not visual rendering.
   *
   * @internal
   * @protected
   * @override
   * @returns {TemplateResult} Empty HTML template
   */
  protected override render(): unknown {
    return html``;
  }
}

/**
 * Default export of the HoopsServiceRegistryElement.
 *
 * @default HoopsServiceRegistryElement
 * @example
 * ```typescript
 * import HoopsServiceRegistry from './hoops-service-registry';
 *
 * const registry = new HoopsServiceRegistry();
 * document.body.appendChild(registry);
 * ```
 */
export default HoopsServiceRegistryElement;
