import { getPlaneCenter } from '../lib/services/cutting/utils';
import CuttingService from '../lib/services/cutting/CuttingService';
import {
  CuttingPlane,
  CuttingServiceConfiguration,
  ICuttingService,
  SelectedFace,
} from '../lib/services/cutting/types';
import { Section } from '../lib/services/cutting/types';
import {
  Box,
  createReferenceGeometryFromFaceNormal,
  IColor,
  Plane,
  Point3,
} from '@ts3d-hoops/common';

const defaultCuttingSections: Section[] = [
  {
    active: true,
    hideReferenceGeometry: false,
    cuttingPlanes: [
      {
        plane: Plane.createFromCoefficients(1, 0, 0, -0.5),
        referenceGeometry: undefined,
      },
    ],
  },
  {
    active: false,
    hideReferenceGeometry: false,
    cuttingPlanes: [
      {
        plane: Plane.createFromCoefficients(1, 0, 0, -0.5),
        referenceGeometry: undefined,
      },
    ],
  },
  {
    active: false,
    hideReferenceGeometry: false,
    cuttingPlanes: [],
  },
  {
    active: false,
    hideReferenceGeometry: false,
    cuttingPlanes: [],
  },
  {
    active: false,
    hideReferenceGeometry: false,
    cuttingPlanes: [],
  },
  {
    active: false,
    hideReferenceGeometry: false,
    cuttingPlanes: [],
  },
];

export class CuttingServiceMock extends EventTarget implements ICuttingService {
  public readonly serviceName = 'CuttingService' as const;

  private cuttingSections: Section[];
  private configuration: CuttingServiceConfiguration;
  private modelBounding: Box = new Box(new Point3(0, 0, 0), new Point3(1, 1, 1));
  private selectedFace: SelectedFace | undefined;

  public fn: (...args: any[]) => any;

  public getCappingGeometryVisibility: () => boolean;
  public setCappingGeometryVisibility: (cappingGeometryVisibility: boolean) => Promise<void>;
  public getCappingFaceColor: () => string | undefined;
  public setCappingFaceColor: (color?: string) => Promise<void>;
  public getCappingLineColor: () => string | undefined;
  public setCappingLineColor: (color?: string) => Promise<void>;
  public getModelBounding: () => Box;
  public setModelBounding: (modelBounding: Box) => void;
  public getSelectedFace: () => SelectedFace | undefined;
  public getCuttingSectionCount: () => number;
  public getCuttingSections: () => Section[];
  public getCuttingSection: (index: number) => Section | undefined;
  public clearCuttingSection: (sectionIndex: number) => Promise<void>;
  public setCuttingSectionState: (sectionIndex: number, active: boolean) => Promise<void>;
  public setCuttingSectionGeometryVisibility: (
    sectionIndex: number,
    visible: boolean,
  ) => Promise<void>;
  public getCuttingPlaneCount: (sectionIndex: number) => number;
  public getCuttingPlanes: (sectionIndex: number) => CuttingPlane[];
  public getCuttingPlane: (sectionIndex: number, planeIndex: number) => CuttingPlane | undefined;
  public addCuttingPlane: (sectionIndex: number, cuttingPlane: CuttingPlane) => Promise<void>;
  public removeCuttingPlane: (sectionIndex: number, planeIndex: number) => Promise<void>;
  public updateCuttingPlane: (
    sectionIndex: number,
    planeIndex: number,
    cuttingPlane: Partial<CuttingPlane>,
  ) => Promise<void>;
  public resetConfiguration: (obj?: object) => Promise<void>;
  public setCuttingPlaneColor: (sectionIndex: number, planeIndex: number, color: IColor) => void;
  public setCuttingPlaneLineColor: (
    sectionIndex: number,
    planeIndex: number,
    lineColor: IColor,
  ) => void;
  public setCuttingPlaneOpacity: (
    sectionIndex: number,
    planeIndex: number,
    opacity: number,
  ) => void;
  public setCuttingPlaneVisibility: (
    sectionIndex: number,
    planeIndex: number,
    visible: boolean,
  ) => Promise<void>;

  constructor(fn: (...args: any[]) => any) {
    super();
    this.fn = fn;

    this.configuration = JSON.parse(JSON.stringify(CuttingService.DefaultConfig));
    this.cuttingSections = this.restoreCuttingSections(
      JSON.parse(JSON.stringify(defaultCuttingSections)),
    );

    // Helper internal functions
    const ensureSection = (index: number): Section => {
      if (index < 0 || index >= this.cuttingSections.length) {
        throw new Error(`No cutting section at index ${index}`);
      }
      return this.cuttingSections[index];
    };
    const ensurePlane = (sectionIndex: number, planeIndex: number): CuttingPlane => {
      const section = ensureSection(sectionIndex);
      if (planeIndex < 0 || planeIndex >= section.cuttingPlanes.length) {
        throw new Error(`No cutting plane at index ${planeIndex} in section ${sectionIndex}`);
      }
      return section.cuttingPlanes[planeIndex];
    };

    // Configuration getters/setters with events mimicking real service
    this.getCappingGeometryVisibility = fn(() => this.configuration.cappingGeometryVisibility);
    this.setCappingGeometryVisibility = fn(async (value: boolean) => {
      this.configuration.cappingGeometryVisibility = value;
      this.dispatchEvent(
        new CustomEvent('hoops-capping-geometry-visibility-changed', {
          bubbles: true,
          composed: true,
          detail: value,
        }),
      );
    });

    this.getCappingFaceColor = fn(() => this.configuration.cappingFaceColor);
    this.setCappingFaceColor = fn(async (color?: string) => {
      this.configuration.cappingFaceColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-capping-face-color-changed', {
          bubbles: true,
          composed: true,
          detail: color,
        }),
      );
    });

    this.getCappingLineColor = fn(() => this.configuration.cappingLineColor);
    this.setCappingLineColor = fn(async (color?: string) => {
      this.configuration.cappingLineColor = color;
      this.dispatchEvent(
        new CustomEvent('hoops-capping-line-color-changed', {
          bubbles: true,
          composed: true,
          detail: color,
        }),
      );
    });

    this.getModelBounding = fn(() => this.modelBounding);
    this.setModelBounding = fn((value: Box) => (this.modelBounding = value));

    this.getSelectedFace = fn(() => this.selectedFace);

    this.getCuttingSectionCount = fn(() => this.cuttingSections.length);
    this.getCuttingSections = fn(() => this.cuttingSections);
    this.getCuttingSection = fn((index: number) =>
      index < 0 || index >= this.cuttingSections.length ? undefined : this.cuttingSections[index],
    );

    this.clearCuttingSection = fn((sectionIndex: number) => {
      const section = ensureSection(sectionIndex); // Validate
      section.cuttingPlanes = [];
      this.dispatchEvent(
        new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
          bubbles: true,
          composed: true,
          detail: { sectionIndex },
        }),
      );
    });

    this.setCuttingSectionState = fn((index: number, active: boolean) => {
      const section = ensureSection(index);
      section.active = active;
      this.dispatchEvent(
        new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
          bubbles: true,
          composed: true,
          detail: { sectionIndex: index },
        }),
      );
    });

    this.setCuttingSectionGeometryVisibility = fn((index: number, visible: boolean) => {
      const section = ensureSection(index);
      section.hideReferenceGeometry = !visible;
      // Mimic reference geometry regeneration when showing
      if (visible) {
        section.cuttingPlanes.forEach((planeData) => {
          if (!planeData.referenceGeometry) {
            planeData.referenceGeometry = createReferenceGeometryFromFaceNormal(
              new Point3(
                planeData.plane.normal.x,
                planeData.plane.normal.y,
                planeData.plane.normal.z,
              ).normalize(),
              getPlaneCenter(planeData.plane, this.modelBounding),
              this.modelBounding,
            );
          }
        });
      } else {
        section.cuttingPlanes.forEach((planeData) => {
          planeData.referenceGeometry = undefined;
        });
      }
      this.dispatchEvent(
        new CustomEvent<{ sectionIndex: number }>('hoops-cutting-section-change', {
          bubbles: true,
          composed: true,
          detail: { sectionIndex: index },
        }),
      );
    });

    this.getCuttingPlaneCount = fn((sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= this.cuttingSections.length) {
        return 0;
      }
      return this.cuttingSections[sectionIndex].cuttingPlanes.length;
    });

    this.getCuttingPlanes = fn((sectionIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= this.cuttingSections.length) {
        return [];
      }
      return this.cuttingSections[sectionIndex].cuttingPlanes;
    });

    this.getCuttingPlane = fn((sectionIndex: number, planeIndex: number) => {
      if (sectionIndex < 0 || sectionIndex >= this.cuttingSections.length) {
        return;
      }
      const section = this.cuttingSections[sectionIndex];
      if (planeIndex < 0 || planeIndex >= section.cuttingPlanes.length) {
        return;
      }
      return section.cuttingPlanes[planeIndex];
    });

    this.addCuttingPlane = fn((sectionIndex: number, cuttingPlane: CuttingPlane) => {
      if (sectionIndex < 0 || sectionIndex > this.cuttingSections.length) {
        throw new Error(`No cutting section at index ${sectionIndex}`);
      }

      if (sectionIndex === this.cuttingSections.length) {
        this.cuttingSections.push({
          active: true,
          hideReferenceGeometry: false,
          cuttingPlanes: [cuttingPlane],
        });
        this.dispatchEvent(
          new CustomEvent('hoops-cutting-section-added', { bubbles: true, composed: true }),
        );
      } else {
        this.cuttingSections[sectionIndex].cuttingPlanes.push(cuttingPlane);
      }

      this.dispatchEvent(
        new CustomEvent<{ sectionIndex: number }>('hoops-cutting-plane-added', {
          bubbles: true,
          composed: true,
          detail: { sectionIndex },
        }),
      );

      // Auto activate inactive section mimic real service
      if (!this.cuttingSections[sectionIndex].active) {
        this.setCuttingSectionState(sectionIndex, true);
      }
    });

    this.removeCuttingPlane = fn((sectionIndex: number, planeIndex: number) => {
      ensurePlane(sectionIndex, planeIndex); // validation
      this.cuttingSections[sectionIndex].cuttingPlanes.splice(planeIndex, 1);
      this.dispatchEvent(
        new CustomEvent<{ sectionIndex: number; planeIndex: number }>(
          'hoops-cutting-plane-removed',
          {
            bubbles: true,
            composed: true,
            detail: { sectionIndex, planeIndex },
          },
        ),
      );
    });

    this.updateCuttingPlane = fn(
      (sectionIndex: number, planeIndex: number, cuttingPlane: Partial<CuttingPlane>) => {
        const target = ensurePlane(sectionIndex, planeIndex);
        // If plane or referenceGeometry provided treat as full setPlane path
        if (cuttingPlane.plane || cuttingPlane.referenceGeometry) {
          const newPlane = cuttingPlane.plane ?? target.plane;
          // Ensure the normal is a proper Point3 instance before normalizing
          newPlane.normal = new Point3(newPlane.normal.x, newPlane.normal.y, newPlane.normal.z);
          newPlane.normal.normalize();
          if (cuttingPlane.referenceGeometry && cuttingPlane.referenceGeometry.length) {
            // Regenerate reference geometry following real service logic
            const bounding = this.modelBounding;
            cuttingPlane.referenceGeometry = createReferenceGeometryFromFaceNormal(
              newPlane.normal,
              getPlaneCenter(newPlane, bounding),
              bounding,
            );
          }
          target.plane = newPlane;
          if (cuttingPlane.referenceGeometry !== undefined) {
            target.referenceGeometry = cuttingPlane.referenceGeometry;
          }
        } else {
          // attribute-only updates
          if (cuttingPlane.color) target.color = cuttingPlane.color;
          if (cuttingPlane.lineColor) target.lineColor = cuttingPlane.lineColor;
          if (cuttingPlane.opacity !== undefined) target.opacity = cuttingPlane.opacity;
        }
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
    );

    this.setCuttingPlaneColor = fn((sectionIndex: number, planeIndex: number, color: IColor) => {
      const plane = ensurePlane(sectionIndex, planeIndex);
      plane.color = color;
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
    });

    this.setCuttingPlaneLineColor = fn(
      (sectionIndex: number, planeIndex: number, lineColor: IColor) => {
        const plane = ensurePlane(sectionIndex, planeIndex);
        plane.lineColor = lineColor;
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
    );

    this.setCuttingPlaneOpacity = fn(
      (sectionIndex: number, planeIndex: number, opacity: number) => {
        const plane = ensurePlane(sectionIndex, planeIndex);
        plane.opacity = opacity;
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
    );

    this.setCuttingPlaneVisibility = fn(
      (sectionIndex: number, planeIndex: number, visible: boolean) => {
        const plane = ensurePlane(sectionIndex, planeIndex);
        plane.referenceGeometry = visible
          ? createReferenceGeometryFromFaceNormal(
              new Point3(
                plane.plane.normal.x,
                plane.plane.normal.y,
                plane.plane.normal.z,
              ).normalize(),
              getPlaneCenter(plane.plane, this.modelBounding),
              this.modelBounding,
            )
          : undefined;
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
    );

    this.resetConfiguration = fn(async (obj?: object): Promise<void> => {
      const config = obj ?? CuttingService.DefaultConfig;
      // Simple validation mirroring isCuttingServiceConfiguration
      const typedConfig = config as CuttingServiceConfiguration;
      if (
        typeof typedConfig.cappingGeometryVisibility !== 'boolean' ||
        (typedConfig.cappingFaceColor !== undefined &&
          typeof typedConfig.cappingFaceColor !== 'string') ||
        (typedConfig.cappingLineColor !== undefined &&
          typeof typedConfig.cappingLineColor !== 'string')
      ) {
        throw new Error('Invalid cutting configuration object');
      }
      this.configuration = {
        cappingGeometryVisibility: typedConfig.cappingGeometryVisibility,
        cappingFaceColor: typedConfig.cappingFaceColor,
        cappingLineColor: typedConfig.cappingLineColor,
      };
      // Dispatch reset event same as real service
      this.dispatchEvent(
        new CustomEvent('hoops-cutting-service-reset', { bubbles: true, composed: true }),
      );
      // Also dispatch individual color/visibility change events (mimic service behavior)
      this.dispatchEvent(
        new CustomEvent('hoops-capping-geometry-visibility-changed', {
          bubbles: true,
          composed: true,
          detail: this.configuration.cappingGeometryVisibility,
        }),
      );
      this.dispatchEvent(
        new CustomEvent('hoops-capping-face-color-changed', {
          bubbles: true,
          composed: true,
          detail: this.configuration.cappingFaceColor,
        }),
      );
      this.dispatchEvent(
        new CustomEvent('hoops-capping-line-color-changed', {
          bubbles: true,
          composed: true,
          detail: this.configuration.cappingLineColor,
        }),
      );
    });
  }

  // Utility to simulate face selection changes for consumers
  public simulateFaceSelection(position?: Point3, normal?: Point3): void {
    if (position && normal) {
      this.selectedFace = { position, normal };
    } else {
      this.selectedFace = undefined;
    }
    this.dispatchEvent(
      new CustomEvent('hoops-cutting-face-selection-change', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  public reset() {
    this.cuttingSections = this.restoreCuttingSections(
      JSON.parse(JSON.stringify(defaultCuttingSections)),
    );
  }

  private restoreCuttingSections(sections: Section[]): Section[] {
    return sections.map((section) => ({
      ...section,
      cuttingPlanes: section.cuttingPlanes.map((plane: CuttingPlane) => ({
        ...plane,
        plane: this.restorePlane(plane.plane),
      })),
    }));
  }

  private restorePlane(planeData: Plane): Plane {
    const plane = new Plane();
    plane.normal = new Point3(planeData.normal.x, planeData.normal.y, planeData.normal.z);
    plane.d = planeData.d;
    return plane;
  }
}

export default CuttingServiceMock;
