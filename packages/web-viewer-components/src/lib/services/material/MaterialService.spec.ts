import { describe, it, expect, vi, beforeEach } from 'vitest';
import MaterialService from './MaterialService';
import { IMaterial } from '@ts3d-hoops/web-viewer';
import { SetShaderOptions } from '@ts3d-hoops/streamcache';
import type { MeshDescription } from './types';
import { Color } from '@ts3d-hoops/common';

describe('MaterialService', () => {
  let service: MaterialService;

  beforeEach(() => {
    service = new MaterialService();
  });

  describe('initialization', () => {
    it('should have correct service name', () => {
      expect(service.serviceName).toBe('MaterialService');
    });

    it('should initialize with empty selected node IDs', () => {
      expect(service.getSelectedNodeIds()).toEqual([]);
    });

    it('should be constructible without viewer', () => {
      expect(service).toBeDefined();
      expect(service.viewer).toBeUndefined();
    });
  });

  describe('viewer property', () => {
    it('should allow setting and getting viewer', () => {
      const mockViewer = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;
      service.viewer = mockViewer;
      expect(service.viewer).toBe(mockViewer);
    });

    it('should dispatch hoops-model-reset when viewer is set', () => {
      const eventSpy = vi.fn();
      service.addEventListener('hoops-model-reset', eventSpy);
      const mockViewer = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;
      service.viewer = mockViewer;
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });

    it('should not dispatch event if viewer is set to same instance', () => {
      const mockViewer = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;
      service.viewer = mockViewer;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-model-reset', eventSpy);
      service.viewer = mockViewer;
      expect(eventSpy).toHaveBeenCalledTimes(0);
    });

    it('should dispatch hoops-model-reset when viewer is changed', () => {
      const mockViewer1 = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;
      service.viewer = mockViewer1;
      const eventSpy = vi.fn();
      service.addEventListener('hoops-model-reset', eventSpy);
      const mockViewer2 = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;
      service.viewer = mockViewer2;
      expect(eventSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSelectedNodeIds', () => {
    it('should return empty array initially', () => {
      expect(service.getSelectedNodeIds()).toEqual([]);
    });

    it('should return array of node IDs', async () => {
      // Create a mock viewer with selection capability
      const mockViewer = {
        selectionManager: {
          getResults: vi
            .fn()
            .mockReturnValue([
              { getNodeId: () => 1 },
              { getNodeId: () => 2 },
              { getNodeId: () => 3 },
            ]),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;

      service.viewer = mockViewer;

      // Simulate selection callback
      const callbackMap = mockViewer.setCallbacks.mock.calls[0][0];
      callbackMap.selectionArray();

      expect(service.getSelectedNodeIds()).toEqual([1, 2, 3]);
    });
  });

  describe('getMeshDescription', () => {
    it('should return undefined when viewer is not set', async () => {
      const result = await service.getMeshDescription(1);
      expect(result).toBeUndefined();
    });

    it('should return mesh description from viewer', async () => {
      const meshData: MeshDescription = {
        faces: {
          vertexCount: 36,
          hasNormals: true,
          hasUVs: false,
          hasRGBAs: false,
          elementCount: 12,
        },
        lines: {
          vertexCount: 0,
          hasNormals: false,
          hasUVs: false,
          hasRGBAs: false,
          elementCount: 0,
        },
        points: {
          vertexCount: 0,
          hasNormals: false,
          hasUVs: false,
          hasRGBAs: false,
          elementCount: 0,
        },
        isTwoSided: false,
        isManifold: true,
        winding: 'counterClockwise',
      };

      const mockViewer = {
        model: {
          getNodeMeshData: vi.fn().mockResolvedValue(meshData),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
      } as any;

      service.viewer = mockViewer;

      const result = await service.getMeshDescription(1);
      expect(result).toEqual(meshData);
      expect(mockViewer.model.getNodeMeshData).toHaveBeenCalledWith(1);
    });
  });

  describe('getMaterialDescription', () => {
    it('should return undefined when viewer is not set', async () => {
      const result = await service.getMaterialDescription(1);
      expect(result).toBeUndefined();
    });

    it('should return material description from viewer', async () => {
      const material: IMaterial = {
        ambientColor: new Color(0.2, 0.2, 0.2),
        specularColor: new Color(1.0, 1.0, 1.0),
        emissiveColor: new Color(0.0, 0.0, 0.0),
        specularIntensity: 32,
      };

      const mockViewer = {
        model: {
          getNodesMaterial: vi.fn().mockResolvedValue([material]),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
      } as any;

      service.viewer = mockViewer;

      const result = await service.getMaterialDescription(1);
      expect(result).toEqual(material);
      expect(mockViewer.model.getNodesMaterial).toHaveBeenCalledWith([1]);
    });

    it('should return undefined when viewer has no materials', async () => {
      const mockViewer = {
        model: {
          getNodesMaterial: vi.fn().mockResolvedValue([]),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
      } as any;

      service.viewer = mockViewer;

      const result = await service.getMaterialDescription(1);
      expect(result).toBeUndefined();
    });
  });

  describe('setNodesShader', () => {
    it('should throw when viewer is not set', async () => {
      const vertexShader = 'void main() {}';
      const fragmentShader = 'void main() { gl_FragColor = vec4(1.0); }';

      await expect(service.setNodesShader([1, 2], vertexShader, fragmentShader)).rejects.toThrow(
        'Viewer not set',
      );
    });

    it('should call setNodesShader on viewer', async () => {
      const vertexShader = 'void main() {}';
      const fragmentShader = 'void main() { gl_FragColor = vec4(1.0); }';
      const options: SetShaderOptions = {
        uniforms: {
          u_time: {
            type: 'float',
            values: 1.0,
          },
        },
      };

      const mockViewer = {
        model: {
          setNodesShader: vi.fn().mockResolvedValue(undefined),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
      } as any;

      service.viewer = mockViewer;

      await service.setNodesShader([1, 2], vertexShader, fragmentShader, options);

      expect(mockViewer.model.setNodesShader).toHaveBeenCalledWith(
        [1, 2],
        vertexShader,
        fragmentShader,
        options,
      );
    });

    it('should work with empty options', async () => {
      const vertexShader = 'void main() {}';
      const fragmentShader = 'void main() { gl_FragColor = vec4(1.0); }';

      const mockViewer = {
        model: {
          setNodesShader: vi.fn().mockResolvedValue(undefined),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
      } as any;

      service.viewer = mockViewer;

      await service.setNodesShader([1], vertexShader, fragmentShader);

      expect(mockViewer.model.setNodesShader).toHaveBeenCalledWith(
        [1],
        vertexShader,
        fragmentShader,
        undefined,
      );
    });
  });

  describe('viewer callbacks', () => {
    it('should dispatch hoops-material-selection-change event on selection change', async () => {
      const mockViewer = {
        selectionManager: {
          getResults: vi.fn().mockReturnValue([{ getNodeId: () => 5 }]),
        },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;

      const eventSpy = vi.fn();
      service.addEventListener('hoops-material-selection-change', eventSpy);

      service.viewer = mockViewer;

      // Simulate selection callback
      const callbackMap = mockViewer.setCallbacks.mock.calls[0][0];
      callbackMap.selectionArray();

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(service.getSelectedNodeIds()).toEqual([5]);
    });

    it('should unbind callbacks when viewer is unset', () => {
      const mockViewer = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;

      service.viewer = mockViewer;
      expect(mockViewer.setCallbacks).toHaveBeenCalledTimes(1);
      expect(mockViewer.unsetCallbacks).toHaveBeenCalledTimes(0);

      service.viewer = undefined;
      expect(mockViewer.unsetCallbacks).toHaveBeenCalledTimes(1);
    });

    it('should properly transition between viewers', () => {
      const mockViewer1 = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;

      const mockViewer2 = {
        selectionManager: { getResults: vi.fn().mockReturnValue([]) },
        setCallbacks: vi.fn(),
        unsetCallbacks: vi.fn(),
      } as any;

      service.viewer = mockViewer1;
      expect(mockViewer1.setCallbacks).toHaveBeenCalledTimes(1);
      expect(mockViewer1.unsetCallbacks).toHaveBeenCalledTimes(0);

      service.viewer = mockViewer2;
      expect(mockViewer1.unsetCallbacks).toHaveBeenCalledTimes(1);
      expect(mockViewer2.setCallbacks).toHaveBeenCalledTimes(1);
    });
  });
});
