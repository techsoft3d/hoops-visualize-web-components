import { IColor, Box, Color, Point3, Plane } from '@ts3d-hoops/common';

import { CallbackMap, core } from '@ts3d-hoops/web-viewer';

import {
  CuttingPlane,
  CuttingServiceConfiguration,
  ICuttingService,
  isCuttingServiceConfiguration,
  Section,
  SelectedFace,
} from './types';
import {
  convertCuttingSections,
  convertHwvCuttingPlaneToCuttingPlane,
  convertHwvSectionToSection,
} from './utils';

/**
 * Utility function to find the index of a specific cutting section in the cutting manager.
 *
 * @param section - The cutting section to find
 * @param cuttingManager - The cutting manager to search in
 * @returns The index of the section, or -1 if not found
 */
function getSectionIndex(
  section: core.ICuttingSection,
  cuttingManager: core.ICuttingManager,
): number {
  const count = cuttingManager.getCuttingSectionCount();
  for (let i = 0; i < count; i++) {
    if (cuttingManager.getCuttingSection(i) === section) {
      return i;
    }
  }
  return -1;
}

/**
 * Generates vertices for a planar quadrilateral representing a cutting plane.
 *
 * This function creates a rectangular geometry that visually represents a cutting plane
 * within the 3D space. The quadrilateral is centered at the origin and oriented within
 * the plane defined by the input plane's normal vector.
 *
 * @param plane - The cutting plane containing normal vector and distance parameters
 * @param boundingBox - The model's bounding box used to determine appropriate quad size
 * @returns Array of 4 Point3 vertices forming a quadrilateral, or empty array if plane normal is zero
 *
 * @example
 * ```typescript
 * const plane = new Plane();
 * plane.normal = new Point3(0, 0, 1); // Z-axis normal
 * plane.d = 0;
 * const bbox = new Box(new Point3(-10, -10, -10), new Point3(10, 10, 10));
 * const vertices = generatePlaneVertices(plane, bbox);
 * // Returns 4 vertices forming a quad in the XY plane
 * ```
 *
 * @remarks
 * - The quadrilateral is sized at 70% of the bounding box's largest dimension
 * - Vertices are generated in a specific order compatible with triangle mesh creation
 * - The quad is centered at origin (0,0,0) and positioned by external transformation
 * - Returns empty array for degenerate planes (zero-length normal)
 * - Uses Gram-Schmidt orthogonalization to create plane-aligned basis vectors
 */
function generatePlaneVertices(plane: Plane, boundingBox: Box): Point3[] {
  const normalLength = plane.normal.length();
  if (normalLength === 0) {
    return [];
  }

  const n = plane.normal.copy().normalize();

  const bmin = boundingBox.min;
  const bmax = boundingBox.max;

  const planeCenter = new Point3(0, 0, 0);

  let u: Point3;

  if (Math.abs(n.x) < Math.abs(n.y) && Math.abs(n.x) < Math.abs(n.z)) {
    u = new Point3(1, 0, 0);
  } else if (Math.abs(n.y) < Math.abs(n.z)) {
    u = new Point3(0, 1, 0);
  } else {
    u = new Point3(0, 0, 1);
  }

  u = Point3.subtract(u, Point3.scale(n, Point3.dot(u, n))).normalize();

  const v = Point3.cross(n, u).normalize();
  const boxSize = Math.max(bmax.x - bmin.x, bmax.y - bmin.y, bmax.z - bmin.z);

  const sizeFactor = boxSize * 0.7;

  const vertices: Point3[] = [
    new Point3(
      planeCenter.x - sizeFactor * u.x - sizeFactor * v.x,
      planeCenter.y - sizeFactor * u.y - sizeFactor * v.y,
      planeCenter.z - sizeFactor * u.z - sizeFactor * v.z,
    ),
    new Point3(
      planeCenter.x + sizeFactor * u.x - sizeFactor * v.x,
      planeCenter.y + sizeFactor * u.y - sizeFactor * v.y,
      planeCenter.z + sizeFactor * u.z - sizeFactor * v.z,
    ),
    new Point3(
      planeCenter.x + sizeFactor * u.x + sizeFactor * v.x,
      planeCenter.y + sizeFactor * u.y + sizeFactor * v.y,
      planeCenter.z + sizeFactor * u.z + sizeFactor * v.z,
    ),
    new Point3(
      planeCenter.x - sizeFactor * u.x + sizeFactor * v.x,
      planeCenter.y - sizeFactor * u.y + sizeFactor * v.y,
      planeCenter.z - sizeFactor * u.z + sizeFactor * v.z,
    ),
  ];

  return vertices;
}

/**
 * Service class for managing cutting plane operations in 3D models.
 *
 * This service provides a high-level interface for creating, managing, and manipulating
 * cutting planes and cutting sections. It acts as a bridge between the UI components
 * and the underlying HOOPS Web Viewer cutting functionality.
 *
 * Key features:
 * - Cutting section management (create, activate, deactivate, clear)
 * - Cutting plane operations (add, remove, update, visibility control)
 * - Visual property management (color, opacity, reference geometry)
 * - Capping geometry configuration
 * - Event dispatching for UI synchronization
 * - Face selection integration for plane creation
 *
 * @fires hoops-cutting-sections-change - When cutting sections are loaded or changed
 * @fires hoops-cutting-section-added - When a new cutting section is added
 * @fires hoops-cutting-section-removed - When a cutting section is removed
 * @fires hoops-cutting-section-change - When a cutting section state changes
 * @fires hoops-cutting-plane-added - When a cutting plane is added to a section
 * @fires hoops-cutting-plane-removed - When a cutting plane is removed
 * @fires hoops-cutting-plane-change - When a cutting plane is modified
 * @fires hoops-capping-geometry-visibility-changed - When capping geometry visibility changes
 * @fires hoops-capping-face-color-changed - When capping face color changes
 * @fires hoops-capping-line-color-changed - When capping line color changes
 * @fires hoops-cutting-face-selection-change - When face selection changes
 * @fires hoops-cutting-service-reset - When the service is reset with a new cutting manager
 *
 * @example
 * ```typescript
 * // Create and configure cutting service
 * const cuttingService = new CuttingService(cuttingManager);
 *
 * // Add event listeners
 * cuttingService.addEventListener('hoops-cutting-plane-change', (event) => {
 *   console.log('Plane changed:', event.detail);
 * });
 *
 * // Create a cutting plane
 * const plane = new Plane();
 * plane.normal = new Point3(1, 0, 0);
 * plane.d = 10;
 *
 * const cuttingPlane = {
 *   plane,
 *   color: { r: 1, g: 0, b: 0 },
 *   opacity: 0.5
 * };
 *
 * cuttingService.addCuttingPlane(0, cuttingPlane);
 * ```
 *
 * @example
 * ```typescript
 * // Configure capping geometry
 * await cuttingService.setCappingGeometryVisibility(true);
 * await cuttingService.setCappingFaceColor('#ff0000');
 * await cuttingService.setCappingLineColor('#000000');
 * ```
 */
export default class CuttingService extends EventTarget implements ICuttingService {
  /** The service identifier for this cutting service. */
  public readonly serviceName = 'CuttingService' as const;

  /** The underlying HOOPS Web Viewer cutting manager. */
  private _cuttingManager?: core.ICuttingManager;
  /** The model's bounding box for sizing reference geometry. */
  private _modelBounding?: Box;
  /** The currently selected face for creating cutting planes. */
  private selectedFace?: SelectedFace | undefined;

  /** Tracks which cutting sections have hidden reference geometry. */
  private sectionHideReferenceGeometry: boolean[] = [];

  /** Callback map for HOOPS Web Viewer events. */
  private callbackMap: CallbackMap;

  /** Default configuration values for the cutting service. */
  public static readonly DefaultConfig: CuttingServiceConfiguration = {
    cappingGeometryVisibility: true,
    cappingFaceColor: '#808080',
    cappingLineColor: '#808080',
  };

  /**
   * Constructs a new CuttingService instance.
   *
   * @param cuttingManager - Optional HOOPS Web Viewer cutting manager to use for operations
   *
   * @example
   * ```typescript
   * // Create service with cutting manager
   * const service = new CuttingService(viewer.cuttingManager);
   *
   * // Create service without manager (can be set later)
   * const service = new CuttingService();
   * service.cuttingManager = viewer.cuttingManager;
   * ```
   */
  constructor(cuttingManager?: core.ICuttingManager) {
    super();
    this._cuttingManager = cuttingManager;

    this.callbackMap = {
      modelSwitched: async () => {
        if (!this._cuttingManager) {
          return;
        }

        const bounding = await this._cuttingManager.viewer.model.getModelBounding(true, false);
        this.setModelBounding(bounding);
      },
      modelStructureReady: async () => {
        if (!this._cuttingManager) {
          return;
        }

        const bounding = await this._cuttingManager.viewer.model.getModelBounding(true, false);
        this.setModelBounding(bounding);
        this.dispatchEvent(
          new CustomEvent('hoops-cutting-sections-change', {
            bubbles: true,
            composed: true,
          }),
        );
      },
      cuttingSectionsLoaded: () => {
        this.dispatchEvent(
          new CustomEvent('hoops-cutting-sections-change', {
            bubbles: true,
            composed: true,
          }),
        );
      },
      removeCuttingSection: () => {
        this.dispatchEvent(
          new CustomEvent('hoops-cutting-section-removed', {
            bubbles: true,
            composed: true,
          }),
        );
      },
      addCuttingSection: () => {
        this.dispatchEvent(
          new CustomEvent('hoops-cutting-section-added', {
            bubbles: true,
            composed: true,
          }),
        );
      },
      cuttingPlaneDragEnd: (section: core.ICuttingSection, planeIndex: number) => {
        if (!this._cuttingManager) {
          return;
        }

        const sectionIndex = getSectionIndex(section, this._cuttingManager);
        this.dispatchEvent(
          new CustomEvent<{ sectionIndex: number; planeIndex: number }>(
            'hoops-cutting-plane-change',
            {
              bubbles: true,
              composed: true,
              detail: { sectionIndex, planeIndex },
            },
          ),
        );
      },
      visibilityChanged: async () => {
        if (!this._cuttingManager) {
          return;
        }

        const bounding = await this._cuttingManager.viewer.model.getModelBounding(true, false);
        this.setModelBounding(bounding);
      },
      selectionArray: () => {
        const selection = this._cuttingManager?.viewer.selectionManager.getLast();
        if (!selection) {
          // Ensure previously stored selected face is cleared when selection is removed
          this.selectedFace = undefined;
        } else {
          this.selectedFace = selection.isFaceSelection()
            ? {
                position: selection.getPosition(),
                normal: selection.getFaceEntity().getNormal(),
              }
            : undefined;
        }

        this.dispatchEvent(
          new CustomEvent('hoops-cutting-face-selection-change', {
            bubbles: true,
            composed: true,
          }),
        );
      },
    };
    if (this._cuttingManager) {
      this.bind();
    }
  }

  /**
   * Binds event callbacks to the HOOPS Web Viewer cutting manager.
   *
   * @internal
   * @throws Error if cutting manager is not set
   */
  private bind(): void {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    this._cuttingManager.viewer.setCallbacks(this.callbackMap);
  }

  /**
   * Unbinds event callbacks from the HOOPS Web Viewer cutting manager.
   *
   * @internal
   * @throws Error if cutting manager is not set
   */
  private unbind(): void {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    this._cuttingManager.viewer.unsetCallbacks(this.callbackMap);
  }

  /**
   * Gets the current HOOPS Web Viewer cutting manager.
   *
   * @returns The cutting manager instance, or undefined if not set
   */
  public get cuttingManager(): core.ICuttingManager | undefined {
    return this._cuttingManager;
  }

  /**
   * Sets the HOOPS Web Viewer cutting manager.
   *
   * Unbinds from the previous cutting manager (if any) and binds to the new one.
   * Dispatches a 'hoops-cutting-service-reset' event when the manager changes.
   *
   * @param cuttingManager - The new cutting manager instance, or undefined to clear
   *
   * @fires hoops-cutting-service-reset - When the cutting manager is changed
   */
  public set cuttingManager(cuttingManager: core.ICuttingManager | undefined) {
    if (this._cuttingManager) {
      this.unbind();
    }

    this._cuttingManager = cuttingManager;
    this.dispatchEvent(
      new CustomEvent('hoops-cutting-service-reset', { bubbles: true, composed: true }),
    );

    if (!this._cuttingManager) {
      return;
    }

    this.bind();
  }

  /**
   * Gets the currently selected face for creating cutting planes.
   *
   * @returns The selected face data, or undefined if no face is selected
   */
  public getSelectedFace(): SelectedFace | undefined {
    return this.selectedFace;
  }

  /**
   * Gets the current model bounding box.
   *
   * @returns The model's bounding box, or an empty Box if not set
   */
  public getModelBounding(): Box {
    return this._modelBounding ?? new Box();
  }

  /**
   * Sets the model bounding box.
   *
   * @param modelBounding - The new model bounding box
   */
  public setModelBounding(modelBounding: Box): void {
    this._modelBounding = modelBounding;
  }

  /**
   * Gets the current capping geometry visibility state.
   *
   * @returns True if capping geometry is visible, false otherwise, or default value if no cutting manager is set
   */
  public getCappingGeometryVisibility(): boolean {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingGeometryVisibility;
    }
    return this._cuttingManager.getCappingGeometryVisibility();
  }

  /**
   * Sets the capping geometry visibility state.
   *
   * @param cappingGeometryVisibility - True to show capping geometry, false to hide
   * @throws Error if cutting manager is not set
   *
   * @fires hoops-capping-geometry-visibility-changed - When visibility state changes
   */
  public async setCappingGeometryVisibility(cappingGeometryVisibility: boolean): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingGeometryVisibility(cappingGeometryVisibility);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-geometry-visibility-changed', {
        bubbles: true,
        composed: true,
        detail: cappingGeometryVisibility,
      }),
    );
  }

  /**
   * Gets the current capping face color.
   *
   * @returns The capping face color as a hex string, or default value if no cutting manager is set
   */
  public getCappingFaceColor(): string | undefined {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingFaceColor;
    }
    const faceColor = this._cuttingManager.getCappingFaceColor();
    return faceColor?.toHexString();
  }

  /**
   * Sets the capping face color.
   *
   * @param color - The color as a hex string (e.g., "#ff0000"), or undefined to use default
   * @throws Error if cutting manager is not set
   *
   * @fires hoops-capping-face-color-changed - When face color changes
   */
  public async setCappingFaceColor(color?: string): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingFaceColor(color ? Color.fromHexString(color) : null);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-face-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  /**
   * Gets the current capping line color.
   *
   * @returns The capping line color as a hex string, or default value if no cutting manager is set
   */
  public getCappingLineColor(): string | undefined {
    if (!this._cuttingManager) {
      return CuttingService.DefaultConfig.cappingLineColor;
    }
    const lineColor = this._cuttingManager.getCappingLineColor();
    return lineColor?.toHexString();
  }

  /**
   * Sets the capping line color.
   *
   * @param color - The color as a hex string (e.g., "#000000"), or undefined to use default
   * @throws Error if cutting manager is not set
   *
   * @fires hoops-capping-line-color-changed - When line color changes
   */
  public async setCappingLineColor(color?: string): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }
    await this._cuttingManager.setCappingLineColor(color ? Color.fromHexString(color) : null);
    this.dispatchEvent(
      new CustomEvent('hoops-capping-line-color-changed', {
        bubbles: true,
        composed: true,
        detail: color,
      }),
    );
  }

  /**
   * Gets the total number of cutting sections.
   *
   * @returns The number of cutting sections, or 0 if no cutting manager is set
   */
  getCuttingSectionCount(): number {
    if (!this._cuttingManager) {
      return 0;
    }

    return this._cuttingManager.getCuttingSectionCount();
  }

  /**
   * Gets all cutting sections.
   *
   * @returns Array of Section objects representing all cutting sections
   */
  getCuttingSections(): Section[] {
    if (!this._cuttingManager) {
      return [];
    }

    const sections = convertCuttingSections(
      this._cuttingManager,
      this.sectionHideReferenceGeometry,
    );
    this.sectionHideReferenceGeometry = sections.map((section) => !!section.hideReferenceGeometry);
    return sections;
  }

  /**
   * Gets a cutting section by index.
   *
   * @param index - The index of the cutting section to retrieve
   * @returns The Section object at the specified index, or undefined if not found
   */
  getCuttingSection(index: number): Section | undefined {
    if (!this._cuttingManager) {
      return undefined;
    }

    const hwvSection = this._cuttingManager.getCuttingSection(index);
    if (!hwvSection) {
      return undefined;
    }

    return convertHwvSectionToSection(hwvSection, this.sectionHideReferenceGeometry[index]);
  }

  /**
   * Clears all cutting planes from the specified cutting section.
   *
   * @param sectionIndex - The index of the cutting section to clear
   * @throws Error if cutting manager is not set or section index is invalid
   *
   * @fires hoops-cutting-section-change - When the section is cleared
   */
  async clearCuttingSection(sectionIndex: number): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    await hwvSection.clear();
    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex },
      }),
    );
  }

  /**
   * Sets the active state of a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to modify
   * @param active - True to activate the section, false to deactivate
   * @throws Error if cutting manager is not set or section index is invalid
   *
   * @fires hoops-cutting-section-change - When the section state changes
   */
  async setCuttingSectionState(sectionIndex: number, active: boolean): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    if (active) {
      await hwvSection.activate();
    } else {
      await hwvSection.deactivate();
    }

    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex },
      }),
    );
  }

  /**
   * Sets the reference geometry visibility for a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to modify
   * @param hidden - True to hide reference geometry, false to show
   * @throws Error if cutting manager is not set or section index is invalid
   *
   * @fires hoops-cutting-section-change - When the section visibility changes
   */
  async setCuttingSectionGeometryVisibility(sectionIndex: number, hidden: boolean): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    this.sectionHideReferenceGeometry[sectionIndex] = hidden;

    await Promise.all(
      hwvSection.getCuttingPlanes().map((cuttingPlane, index) => {
        const plane = cuttingPlane.plane;
        let refGeo: typeof cuttingPlane.referenceGeometry | null;
        if (!hidden) {
          if (cuttingPlane.referenceGeometry) {
            refGeo = cuttingPlane.referenceGeometry;
          } else if (this._cuttingManager) {
            // Use existing bounding or a default Box to guarantee geometry creation
            const bounding = this._modelBounding ?? new Box();
            refGeo = generatePlaneVertices(plane, bounding);
          } else {
            refGeo = null;
          }
        } else {
          refGeo = null;
        }
        return hwvSection.setPlane(index, cuttingPlane.plane, refGeo, cuttingPlane);
      }),
    );

    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex },
      }),
    );
  }

  /**
   * Gets the number of cutting planes in a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @returns The number of cutting planes in the section, or 0 if section not found
   */
  getCuttingPlaneCount(sectionIndex: number): number {
    if (!this._cuttingManager) {
      return 0;
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      return 0;
    }

    return hwvSection.getCount();
  }

  /**
   * Gets all cutting planes from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @returns Array of CuttingPlane objects representing all planes in the section
   */
  getCuttingPlanes(sectionIndex: number): CuttingPlane[] {
    if (!this._cuttingManager) {
      return [];
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      return [];
    }

    const hwvPlanes = hwvSection.getCuttingPlanes();
    return hwvPlanes.map(convertHwvCuttingPlaneToCuttingPlane);
  }

  /**
   * Gets a specific cutting plane from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @param planeIndex - The index of the cutting plane within the section
   * @returns The CuttingPlane object at the specified indices, or undefined if not found
   */
  getCuttingPlane(sectionIndex: number, planeIndex: number): CuttingPlane | undefined {
    if (!this._cuttingManager) {
      return undefined;
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      return undefined;
    }

    const hwvPlane = hwvSection.getCuttingPlanes()[planeIndex];
    if (!hwvPlane) {
      return undefined;
    }

    return convertHwvCuttingPlaneToCuttingPlane(hwvPlane);
  }

  /**
   * Adds a cutting plane to a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to add the plane to
   * @param cuttingPlane - The CuttingPlane object containing plane definition and visual properties
   * @throws Error if cutting manager is not set or section index is invalid
   *
   * @fires hoops-cutting-plane-added - When the plane is successfully added
   *
   * @example
   * ```typescript
   * const plane = new Plane();
   * plane.normal = new Point3(1, 0, 0);
   * plane.d = 0;
   *
   * const cuttingPlane = {
   *   plane,
   *   color: { r: 1, g: 0, b: 0 },
   *   opacity: 0.5
   * };
   *
   * service.addCuttingPlane(0, cuttingPlane);
   * ```
   */
  async addCuttingPlane(sectionIndex: number, cuttingPlane: CuttingPlane): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    await hwvSection.addPlane(
      cuttingPlane.plane,
      cuttingPlane.referenceGeometry ?? null,
      cuttingPlane,
    );

    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number }>('hoops-cutting-plane-added', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex },
      }),
    );

    if (!hwvSection.isActive()) {
      this.setCuttingSectionState(sectionIndex, true);
    }
  }

  /**
   * Removes a cutting plane from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to remove
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-removed - When the plane is successfully removed
   */
  async removeCuttingPlane(sectionIndex: number, planeIndex: number): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    const hwvPlanes = hwvSection.getCuttingPlanes();
    if (planeIndex < 0 || planeIndex >= hwvPlanes.length) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    await hwvSection.removePlane(planeIndex);
    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-removed', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Updates properties of an existing cutting plane.
   *
   * This method allows partial updates to cutting plane properties including plane geometry,
   * visual properties (color, opacity), and reference geometry. The plane normal is automatically
   * normalized for proper reference geometry alignment.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to update
   * @param cuttingPlane - Partial CuttingPlane object with properties to update
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-change - When the plane is successfully updated
   *
   * @example
   * ```typescript
   * // Update only the color
   * service.updateCuttingPlane(0, 0, {
   *   color: { r: 0, g: 1, b: 0 }
   * });
   *
   * // Update plane position and opacity
   * const newPlane = new Plane();
   * newPlane.normal = new Point3(0, 1, 0);
   * newPlane.d = 5;
   *
   * service.updateCuttingPlane(0, 0, {
   *   plane: newPlane,
   *   opacity: 0.8
   * });
   * ```
   */
  async updateCuttingPlane(
    sectionIndex: number,
    planeIndex: number,
    cuttingPlane: Partial<CuttingPlane>,
  ): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    const hwvPlanes = hwvSection.getCuttingPlanes();
    if (planeIndex < 0 || planeIndex >= hwvPlanes.length) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    const hwvPlane = hwvPlanes[planeIndex];

    if (cuttingPlane.plane || cuttingPlane.referenceGeometry) {
      const newPlane = cuttingPlane.plane ?? hwvPlane.plane;
      /* COM-4607: Normalize the plane normal so that reference geometry aligns with the plane.
       * This is a workaround for the fact that the normal supplied by the user may not be a unit vector,
       * and non-unit vectors are handled poorly. In a more complete solution, we should simply handle
       * non-unit normals in the reference geometry code.
       */
      const plane = newPlane;
      //plane.normal.normalize();

      const length = plane.normal.length();
      if (length > 0 && cuttingPlane.referenceGeometry && this._cuttingManager) {
        const refGeo = generatePlaneVertices(newPlane, this.getModelBounding());
        cuttingPlane.referenceGeometry = refGeo;
      }

      const newReferenceGeometry =
        cuttingPlane.referenceGeometry !== undefined
          ? cuttingPlane.referenceGeometry
          : hwvPlane.referenceGeometry;

      await hwvSection.setPlane(planeIndex, newPlane, newReferenceGeometry ?? null, {
        color: cuttingPlane.color ?? hwvPlane.color,
        lineColor: cuttingPlane.lineColor ?? hwvPlane.lineColor,
        opacity: cuttingPlane.opacity ?? hwvPlane.opacity,
      });
    } else {
      if (cuttingPlane.color) {
        hwvSection.setPlaneColor(
          planeIndex,
          new Color(cuttingPlane.color.r, cuttingPlane.color.g, cuttingPlane.color.b),
        );
      }
      if (cuttingPlane.lineColor) {
        hwvSection.setPlaneLineColor(
          planeIndex,
          new Color(cuttingPlane.lineColor.r, cuttingPlane.lineColor.g, cuttingPlane.lineColor.b),
        );
      }
      if (cuttingPlane.opacity !== undefined) {
        hwvSection.setPlaneOpacity(planeIndex, cuttingPlane.opacity);
      }
    }

    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Sets the visibility of reference geometry for a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param visible - True to show reference geometry, false to hide
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-change - When the plane visibility changes
   */
  async setCuttingPlaneVisibility(
    sectionIndex: number,
    planeIndex: number,
    visible: boolean,
  ): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    if (planeIndex < 0 || planeIndex >= hwvSection.getCount()) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    const bounding = this.getModelBounding();
    const cuttingPlane = hwvSection.getCuttingPlanes()[planeIndex];
    const geometry =
      visible && this._cuttingManager ? generatePlaneVertices(cuttingPlane.plane, bounding) : null;
    cuttingPlane.referenceGeometry = geometry;
    await hwvSection.setPlane(planeIndex, cuttingPlane.plane, geometry, cuttingPlane);

    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Sets the face color of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param color - The new face color (RGB values between 0 and 1)
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-change - When the plane color changes
   */
  setCuttingPlaneColor(sectionIndex: number, planeIndex: number, color: IColor): void {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    if (planeIndex < 0 || planeIndex >= hwvSection.getCount()) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    hwvSection.setPlaneColor(planeIndex, new Color(color.r, color.g, color.b));
    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Sets the line color of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param lineColor - The new line color (RGB values between 0 and 1)
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-change - When the plane line color changes
   */
  setCuttingPlaneLineColor(sectionIndex: number, planeIndex: number, lineColor: IColor): void {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    if (planeIndex < 0 || planeIndex >= hwvSection.getCount()) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    hwvSection.setPlaneLineColor(planeIndex, new Color(lineColor.r, lineColor.g, lineColor.b));
    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Sets the opacity of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param opacity - The new opacity value (between 0.0 and 1.0)
   * @throws Error if cutting manager is not set, section index is invalid, or plane index is invalid
   *
   * @fires hoops-cutting-plane-change - When the plane opacity changes
   */
  setCuttingPlaneOpacity(sectionIndex: number, planeIndex: number, opacity: number): void {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const hwvSection = this._cuttingManager.getCuttingSection(sectionIndex);
    if (!hwvSection) {
      throw new Error(`No cutting section at index ${sectionIndex}`);
    }

    if (planeIndex < 0 || planeIndex >= hwvSection.getCount()) {
      throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
    }

    hwvSection.setPlaneOpacity(planeIndex, opacity);
    this.dispatchEvent(
      new CustomEvent<{ sectionIndex: number; planeIndex: number }>('hoops-cutting-plane-change', {
        bubbles: true,
        composed: true,
        detail: { sectionIndex, planeIndex },
      }),
    );
  }

  /**
   * Resets the cutting service configuration to default values or provided configuration.
   *
   * @param obj - Optional configuration object to apply, or undefined to use default configuration
   * @throws Error if cutting manager is not set or configuration object is invalid
   *
   * @example
   * ```typescript
   * // Reset to default configuration
   * await service.resetConfiguration();
   *
   * // Apply custom configuration
   * await service.resetConfiguration({
   *   cappingGeometryVisibility: false,
   *   cappingFaceColor: '#ff0000',
   *   cappingLineColor: '#000000'
   * });
   * ```
   */
  public async resetConfiguration(obj?: object): Promise<void> {
    if (!this._cuttingManager) {
      throw new Error('Cutting manager not set');
    }

    const config = obj ?? CuttingService.DefaultConfig;

    if (!isCuttingServiceConfiguration(config)) {
      throw new Error('Invalid cutting configuration object');
    }

    this.setCappingGeometryVisibility(config.cappingGeometryVisibility);
    this.setCappingFaceColor(config.cappingFaceColor);
    this.setCappingLineColor(config.cappingLineColor);
  }
}
