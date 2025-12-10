import { CuttingPlane as HwvCuttingPlane, core } from '@ts3d-hoops/web-viewer';
import {
  Box,
  Point3,
  Plane,
  get3dBaseFromVector,
  sortVerticesCounterClockwise,
} from '@ts3d-hoops/common';
import { CuttingPlane, Section } from './types';

/**
 * Converts a HOOPS Web Viewer cutting plane to the service layer cutting plane type.
 *
 * This function transforms the internal HWV cutting plane representation into
 * the standardized CuttingPlane type used by the cutting service, mapping
 * all visual and geometric properties.
 *
 * @param hwvPlane - The HOOPS Web Viewer cutting plane to convert
 * @returns A CuttingPlane object with mapped properties from the HWV plane
 *
 * @example
 * ```typescript
 * const hwvPlane = hwvSection.getCuttingPlanes()[0];
 * const cuttingPlane = convertHwvCuttingPlaneToCuttingPlane(hwvPlane);
 * console.log(cuttingPlane.plane, cuttingPlane.color);
 * ```
 */
export function convertHwvCuttingPlaneToCuttingPlane(hwvPlane: HwvCuttingPlane): CuttingPlane {
  return {
    plane: hwvPlane.plane,
    referenceGeometry: hwvPlane.referenceGeometry ?? undefined,
    color: hwvPlane.color,
    lineColor: hwvPlane.lineColor,
    opacity: hwvPlane.opacity,
    hideReferenceGeometry: !hwvPlane.referenceGeometry,
  };
}

/**
 * Converts a HOOPS Web Viewer cutting section to the service layer section type.
 *
 * This function transforms the internal HWV cutting section representation into
 * the standardized Section type used by the cutting service, including all
 * cutting planes and section properties.
 *
 * @param hwvSection - The HOOPS Web Viewer cutting section to convert
 * @param hidden - Whether reference geometry should be hidden for this section
 * @returns A Section object with mapped properties from the HWV section
 *
 * @example
 * ```typescript
 * const hwvSection = cuttingManager.getCuttingSection(0);
 * const section = convertHwvSectionToSection(hwvSection, false);
 * console.log(section.active, section.cuttingPlanes.length);
 * ```
 */
export function convertHwvSectionToSection(
  hwvSection: core.ICuttingSection,
  hidden: boolean,
): Section {
  const hwvPlanes = hwvSection.getCuttingPlanes();
  return {
    cuttingPlanes: hwvPlanes.map(convertHwvCuttingPlaneToCuttingPlane),
    active: hwvSection.isActive(),
    hideReferenceGeometry: !!hidden,
  };
}

/**
 * Converts all cutting sections from a cutting manager to service layer section types.
 *
 * This function iterates through all cutting sections in the manager and converts
 * them to the standardized Section type, with optional hidden state tracking.
 *
 * @param cuttingManager - The HOOPS Web Viewer cutting manager containing sections
 * @param hidden - Optional array of boolean flags indicating which sections have hidden reference geometry
 * @returns Array of Section objects representing all cutting sections
 *
 * @example
 * ```typescript
 * const sections = convertCuttingSections(cuttingManager, [false, true, false]);
 * console.log(`Found ${sections.length} cutting sections`);
 * ```
 */
export function convertCuttingSections(
  cuttingManager: core.ICuttingManager,
  hidden?: boolean[],
): Section[] {
  return [...Array(cuttingManager.getCuttingSectionCount())].map((_, index) => {
    const section = cuttingManager.getCuttingSection(index);
    if (!section) {
      throw new Error(`Cutting section at index ${index} not found`);
    }
    return convertHwvSectionToSection(
      section,
      hidden && hidden.length > index ? hidden[index] : false,
    );
  });
}

/**
 * Generates reference geometry vertices for a cutting plane based on face selection.
 *
 * Creates a quadrilateral mesh that visually represents the cutting plane,
 * positioned and oriented based on the plane's normal vector and a selected
 * position. The geometry is sized according to the model's bounding box.
 *
 * @param plane - The cutting plane definition with normal vector and distance
 * @param position - The position point where the plane intersects the model
 * @param modelBounding - The model's bounding box for sizing the reference geometry
 * @returns Array of Point3 vertices forming a quadrilateral in counter-clockwise order
 *
 * @example
 * ```typescript
 * const plane = new Plane(new Point3(1, 0, 0), 10);
 * const position = new Point3(10, 0, 0);
 * const vertices = getReferenceGeometry(plane, position, modelBounding);
 * console.log(`Generated ${vertices.length} vertices for reference geometry`);
 * ```
 *
 * @remarks
 * - Uses 3D basis vectors derived from the plane normal for proper orientation
 * - Scales geometry to 50% of the model's extents for appropriate visual size
 * - Vertices are sorted counter-clockwise for consistent mesh rendering
 */
export function getReferenceGeometry(plane: Plane, position: Point3, modelBounding: Box) {
  const base = get3dBaseFromVector(plane.normal.copy().normalize());
  const extents = modelBounding.extents().scale(0.5);
  return sortVerticesCounterClockwise(
    [
      Point3.subtract(base[1], base[2]),
      Point3.add(base[1], base[2]),
      Point3.subtract(base[2], base[1]),
      Point3.subtract(Point3.scale(base[2], -1), base[1]),
    ].map((current) =>
      Point3.add(
        new Point3(current.x * extents.x, current.y * extents.y, current.z * extents.z),
        position,
      ),
    ),
    base,
  ).map((p) => new Point3(p.x, p.y, p.z));
}

/**
 * Calculates the center point of a cutting plane within a bounding box.
 *
 * This function determines where a cutting plane intersects with the center
 * of a model's bounding box, taking into account the plane's distance offset.
 * The calculation projects the plane's position onto the bounding box center.
 *
 * @param plane - The cutting plane with normal vector and distance properties
 * @param bounding - The model's bounding box to calculate center positioning
 * @returns Point3 representing the plane's center position within the bounding box
 *
 * @example
 * ```typescript
 * const plane = new Plane(new Point3(1, 0, 0), 5);
 * const bounding = new Box(new Point3(-10, -10, -10), new Point3(10, 10, 10));
 * const center = getPlaneCenter(plane, bounding);
 * console.log(`Plane center at: ${center.x}, ${center.y}, ${center.z}`);
 * ```
 *
 * @remarks
 * - Normalizes the plane normal vector for consistent calculations
 * - Applies the plane's distance offset to position the center correctly
 * - Combines bounding box center with plane offset for final positioning
 */
export function getPlaneCenter(plane: Plane, bounding: Box) {
  const center = bounding.center();
  const normal = plane.normal.copy().normalize();
  const offset = Point3.scale(normal, -plane.d / plane.normal.length());
  return Point3.add(offset, center);
}
