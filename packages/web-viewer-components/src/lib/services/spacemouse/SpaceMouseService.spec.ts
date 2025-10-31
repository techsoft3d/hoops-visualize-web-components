import { describe, expect, it, vi, beforeEach } from 'vitest';

import SpaceMouseService from './SpaceMouseService';

const createMockSpaceMouseOperator = () => ({
  connect: vi.fn(),
});

describe('SpaceMouseService', () => {
  let service: SpaceMouseService;

  beforeEach(() => {
    service = new SpaceMouseService();
    vi.clearAllMocks();
  });

  describe('without spaceMouseOperator set', () => {
    it('should have the correct service name', () => {
      expect(service.serviceName).toBe('SpaceMouseService');
    });

    it('should return undefined for spaceMouseOperator', () => {
      expect(service.spaceMouseOperator).toBeUndefined();
    });

    it('should throw when trying to connect without spaceMouseOperator', () => {
      expect(() => service.connect()).toThrow('SpaceMouseOperator is not initialized');
    });
  });

  describe('with spaceMouseOperator set', () => {
    const mockSpaceMouseOperator = createMockSpaceMouseOperator() as any;

    beforeEach(() => {
      service.spaceMouseOperator = mockSpaceMouseOperator;
    });

    it('should return the spaceMouseOperator', () => {
      expect(service.spaceMouseOperator).toBe(mockSpaceMouseOperator);
    });

    it('should connect to space mouse', () => {
      service.connect();

      expect(mockSpaceMouseOperator.connect).toHaveBeenCalled();
    });

    it('should reinitialize when setting a different spaceMouseOperator', () => {
      const newMockSpaceMouseOperator = createMockSpaceMouseOperator() as any;
      service.spaceMouseOperator = newMockSpaceMouseOperator;
      expect(service.spaceMouseOperator).toBe(newMockSpaceMouseOperator);
    });
  });
});
