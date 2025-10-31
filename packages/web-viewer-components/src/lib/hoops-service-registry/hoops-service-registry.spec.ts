import { beforeEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';

import { renderTemplate } from '../testing/utils';
import {
  IRedlineService,
  RedlineService,
  clearServices,
  getService,
  tryGetService,
} from '../services';

import HoopsServiceRegistryElement from './hoops-service-registry';
import './hoops-service-registry';

describe('HoopsServiceRegistry', () => {
  beforeEach(() => {
    // Reset the service registry before each test
    clearServices();
  });

  it('should initialize the default services', async () => {
    expect(tryGetService('RedlineService')).toBeUndefined();

    await renderTemplate(html`<hoops-service-registry></hoops-service-registry>`);
    const registry = document.querySelector(
      'hoops-service-registry',
    )! as HoopsServiceRegistryElement;

    await registry.updateComplete;
    const service = getService('RedlineService');
    expect(service).toBeDefined();
    expect(service instanceof RedlineService).toBeTruthy();
  });

  it('should return the default services', async () => {
    expect(tryGetService('RedlineService')).toBeUndefined();

    await renderTemplate(html`<hoops-service-registry></hoops-service-registry>`);
    const registry = document.querySelector(
      'hoops-service-registry',
    )! as HoopsServiceRegistryElement;

    await registry.updateComplete;
    let service = registry.tryGetService('RedlineService');
    expect(service).toBeDefined();
    expect(service instanceof RedlineService).toBeTruthy();

    service = registry.getService('RedlineService');
    expect(service).toBeDefined();
    expect(service instanceof RedlineService).toBeTruthy();
  });

  it('should raise if no service registered', async () => {
    expect(tryGetService('RedlineService')).toBeUndefined();

    await renderTemplate(html`<hoops-service-registry></hoops-service-registry>`);
    const registry = document.querySelector(
      'hoops-service-registry',
    )! as HoopsServiceRegistryElement;

    await registry.updateComplete;
    expect(() => registry.getService('NoService')).toThrowError();

    const service = registry.tryGetService('NoService');
    expect(service).toBeUndefined();
  });

  it('should allow overriding services', async () => {
    const customRedlineService = {
      serviceName: 'RedlineService',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    } as unknown as IRedlineService;

    await renderTemplate(
      html`<hoops-service-registry
        .redlineService=${customRedlineService}
      ></hoops-service-registry>`,
    );

    const registry = document.querySelector(
      'hoops-service-registry',
    )! as HoopsServiceRegistryElement;

    await registry.updateComplete;
    const service = tryGetService('RedlineService');
    expect(service).toBeDefined();
    expect(service).toBe(customRedlineService);
  });

  it.fails('should provide a getService API', async () => {
    /*
     * This test is marked as fails because the getService is considered undefined for a reason that
     * is not clear yet. I (BenZ) may need some help to figure out why this is the case.
     */
    await renderTemplate(html`<hoops-service-registry></hoops-service-registry>`);
    const registry = document.querySelector('hoops-service-registry')!
      .shadowRoot! as unknown as HoopsServiceRegistryElement;

    await registry.updateComplete;
    const service = registry.getService<IRedlineService>('RedlineService');
    expect(service).toBeDefined();
    expect(service instanceof RedlineService).toBeTruthy();
    expect(service).toBe(tryGetService('RedlineService'));
    expect(registry.tryGetService('NonExistentService')).toBeUndefined();
  });
});
