import { Box, IColor, Plane, Point3 } from '@ts3d-hoops/common';
import { IResettableConfigurationService, IService } from '../types';

/**
 * Represents a selected face in the 3D model for cutting plane creation.
 *
 * Contains the geometric information needed to create a cutting plane
 * based on a user's face selection in the 3D viewer.
 *
 * @example
 * ```typescript
 * const selectedFace: SelectedFace = {
 *   normal: new Point3(0, 1, 0),     // Face points upward
 *   position: new Point3(10, 5, 15)  // Point on the face
 * };
 * ```
 */
export type SelectedFace = {
  /** The normal vector of the selected face. */
  normal: Point3;
  /** A position point on the selected face surface. */
  position: Point3;
};

/**
 * Represents a cutting plane with its geometric and visual properties.
 *
 * Defines a plane that can cut through 3D geometry, along with optional
 * visual properties for rendering the plane's reference geometry.
 *
 * @example
 * ```typescript
 * const cuttingPlane: CuttingPlane = {
 *   plane: new Plane(new Point3(1, 0, 0), 10),
 *   color: { r: 1, g: 0, b: 0 },
 *   opacity: 0.5,
 *   hideReferenceGeometry: false
 * };
 * ```
 */
export type CuttingPlane = {
  /** The mathematical plane definition (normal vector and distance). */
  plane: Plane;
  /** Optional 3D vertices defining the visual representation of the plane. */
  referenceGeometry?: Point3[];
  /** Optional face color for the plane's visual representation (RGB values 0-1). */
  color?: IColor;
  /** Optional line color for the plane's edges (RGB values 0-1). */
  lineColor?: IColor;
  /** Optional opacity value for the plane's visual representation (0-1). */
  opacity?: number;
  /** Optional flag to hide the plane's reference geometry. */
  hideReferenceGeometry?: boolean;
};

/**
 * Represents a cutting section containing multiple cutting planes.
 *
 * A section groups related cutting planes together and can be
 * activated/deactivated as a unit to control the cutting operation.
 *
 * @example
 * ```typescript
 * const section: Section = {
 *   cuttingPlanes: [plane1, plane2],
 *   active: true,
 *   hideReferenceGeometry: false
 * };
 * ```
 */
export type Section = {
  /** Array of cutting planes contained in this section. */
  cuttingPlanes: CuttingPlane[];
  /** Whether this cutting section is currently active (performing cuts). */
  active: boolean;
  /** Optional flag to hide reference geometry for all planes in this section. */
  hideReferenceGeometry?: boolean;
};

/**
 * Configuration object for the cutting service settings.
 *
 * Defines the global settings that affect how cutting operations
 * and capping geometry are displayed.
 *
 * @example
 * ```typescript
 * const config: CuttingServiceConfiguration = {
 *   cappingGeometryVisibility: true,
 *   cappingFaceColor: '#808080',
 *   cappingLineColor: '#000000'
 * };
 * ```
 */
export type CuttingServiceConfiguration = {
  /** Whether capping geometry (fill surfaces) should be visible on cut surfaces. */
  cappingGeometryVisibility: boolean;
  /** Optional hex color string for capping face surfaces (e.g., "#ff0000"). */
  cappingFaceColor?: string;
  /** Optional hex color string for capping edge lines (e.g., "#000000"). */
  cappingLineColor?: string;
};

/**
 * Type guard function to validate CuttingServiceConfiguration objects.
 *
 * Checks if an unknown object conforms to the CuttingServiceConfiguration
 * interface structure and has valid property types.
 *
 * @param obj - The object to validate
 * @returns True if the object is a valid CuttingServiceConfiguration, false otherwise
 *
 * @example
 * ```typescript
 * const userInput: unknown = { cappingGeometryVisibility: true };
 *
 * if (isCuttingServiceConfiguration(userInput)) {
 *   // userInput is now typed as CuttingServiceConfiguration
 *   console.log(userInput.cappingGeometryVisibility);
 * }
 * ```
 */
export function isCuttingServiceConfiguration(obj: unknown): obj is CuttingServiceConfiguration {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const value = obj as CuttingServiceConfiguration;
  return (
    typeof value.cappingGeometryVisibility === 'boolean' &&
    (typeof value.cappingFaceColor === 'string' || typeof value.cappingFaceColor === 'undefined') &&
    (typeof value.cappingLineColor === 'string' || typeof value.cappingLineColor === 'undefined')
  );
}

/**
 * Service interface for managing cutting operations in 3D models.
 *
 * Extends the base IService and IResettableConfigurationService interfaces
 * to provide comprehensive cutting plane and section management capabilities.
 *
 * This interface defines methods for:
 * - Managing cutting sections (groups of cutting planes)
 * - Creating, modifying, and removing individual cutting planes
 * - Controlling visual properties (colors, opacity, visibility)
 * - Configuring capping geometry for cut surfaces
 * - Handling face selections for plane creation
 *
 * @interface ICuttingService
 * @extends IService, IResettableConfigurationService
 *
 * @example
 * ```typescript
 * class CuttingService implements ICuttingService {
 *   // Implementation of all cutting-related operations
 * }
 * ```
 */
export interface ICuttingService extends IService, IResettableConfigurationService {
  /**
   * Gets the current capping geometry visibility state.
   *
   * @returns True if capping geometry is visible, false otherwise
   */
  getCappingGeometryVisibility(): boolean;

  /**
   * Sets the capping geometry visibility state.
   *
   * @param cappingGeometryVisibility - True to show capping geometry, false to hide
   * @returns Promise that resolves when the operation completes
   */
  setCappingGeometryVisibility(cappingGeometryVisibility: boolean): Promise<void>;

  /**
   * Gets the current capping face color.
   *
   * @returns The capping face color as a hex string, or undefined if no color is set
   */
  getCappingFaceColor(): string | undefined;

  /**
   * Sets the capping face color.
   *
   * @param color - Optional hex color string (e.g., "#ff0000"), or undefined to clear
   * @returns Promise that resolves when the operation completes
   */
  setCappingFaceColor(color?: string): Promise<void>;

  /**
   * Gets the current capping line color.
   *
   * @returns The capping line color as a hex string, or undefined if no color is set
   */
  getCappingLineColor(): string | undefined;

  /**
   * Sets the capping line color.
   *
   * @param color - Optional hex color string (e.g., "#000000"), or undefined to clear
   * @returns Promise that resolves when the operation completes
   */
  setCappingLineColor(color?: string): Promise<void>;

  /**
   * Gets the current model bounding box.
   *
   * @returns The model's bounding box for reference geometry sizing
   */
  getModelBounding(): Box;

  /**
   * Sets the model bounding box.
   *
   * @param modelBounding - The new model bounding box
   */
  setModelBounding(modelBounding: Box): void;

  /**
   * Gets the currently selected face for cutting plane creation.
   *
   * @returns The selected face data, or undefined if no face is selected
   */
  getSelectedFace(): SelectedFace | undefined;

  /**
   * Gets the total number of cutting sections.
   *
   * @returns The number of cutting sections
   */
  getCuttingSectionCount(): number;

  /**
   * Gets all cutting sections.
   *
   * @returns Array of all cutting sections
   */
  getCuttingSections(): Section[];

  /**
   * Gets a specific cutting section by index.
   *
   * @param index - The index of the cutting section to retrieve
   * @returns The cutting section at the specified index, or undefined if not found
   */
  getCuttingSection(index: number): Section | undefined;

  /**
   * Clears all cutting planes from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to clear
   */
  clearCuttingSection(sectionIndex: number): Promise<void>;

  /**
   * Sets the active state of a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to modify
   * @param active - True to activate the section, false to deactivate
   */
  setCuttingSectionState(sectionIndex: number, active: boolean): Promise<void>;

  /**
   * Sets the reference geometry visibility for a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to modify
   * @param visible - True to show reference geometry, false to hide
   */
  setCuttingSectionGeometryVisibility(sectionIndex: number, visible: boolean): Promise<void>;

  /**
   * Gets the number of cutting planes in a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @returns The number of cutting planes in the section
   */
  getCuttingPlaneCount(sectionIndex: number): number;

  /**
   * Gets all cutting planes from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @returns Array of cutting planes in the section
   */
  getCuttingPlanes(sectionIndex: number): CuttingPlane[];

  /**
   * Gets a specific cutting plane from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section
   * @param planeIndex - The index of the cutting plane within the section
   * @returns The cutting plane at the specified indices, or undefined if not found
   */
  getCuttingPlane(sectionIndex: number, planeIndex: number): CuttingPlane | undefined;

  /**
   * Adds a cutting plane to a cutting section.
   *
   * @param sectionIndex - The index of the cutting section to add the plane to
   * @param cuttingPlane - The cutting plane to add
   */
  addCuttingPlane(sectionIndex: number, cuttingPlane: CuttingPlane): Promise<void>;

  /**
   * Removes a cutting plane from a cutting section.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to remove
   */
  removeCuttingPlane(sectionIndex: number, planeIndex: number): Promise<void>;

  /**
   * Updates properties of an existing cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to update
   * @param cuttingPlane - Partial cutting plane object with properties to update
   */
  updateCuttingPlane(
    sectionIndex: number,
    planeIndex: number,
    cuttingPlane: Partial<CuttingPlane>,
  ): Promise<void>;

  /**
   * Sets the visibility of reference geometry for a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param visible - True to show reference geometry, false to hide
   */
  setCuttingPlaneVisibility(
    sectionIndex: number,
    planeIndex: number,
    visible: boolean,
  ): Promise<void>;

  /**
   * Sets the face color of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param color - The new face color (RGB values between 0 and 1)
   */
  setCuttingPlaneColor(sectionIndex: number, planeIndex: number, color: IColor): void;

  /**
   * Sets the line color of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param lineColor - The new line color (RGB values between 0 and 1)
   */
  setCuttingPlaneLineColor(sectionIndex: number, planeIndex: number, lineColor: IColor): void;

  /**
   * Sets the opacity of a specific cutting plane.
   *
   * @param sectionIndex - The index of the cutting section containing the plane
   * @param planeIndex - The index of the cutting plane to modify
   * @param opacity - The new opacity value (between 0.0 and 1.0)
   */
  setCuttingPlaneOpacity(sectionIndex: number, planeIndex: number, opacity: number): void;

  /**
   * Resets the cutting service configuration to default values or provided configuration.
   *
   * @param obj - Optional configuration object to apply, or undefined to use default configuration
   * @returns Promise that resolves when the configuration is applied
   */
  resetConfiguration(obj?: object): Promise<void>;
}
