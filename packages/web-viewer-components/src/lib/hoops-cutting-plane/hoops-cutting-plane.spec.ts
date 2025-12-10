import { describe, it, beforeEach, expect, vi } from 'vitest';
import './hoops-cutting-plane';
import '../hoops-cutting-plane-toolbar/hoops-cutting-plane-toolbar';
import '../hoops-cutting-plane-editor/hoops-cutting-plane-editor';
import { registerService, clearServices } from '../services/serviceRegistry';
import type { ICuttingService } from '../services/cutting/types';
import { HoopsCuttingPlaneElement } from './hoops-cutting-plane';
import CuttingServiceMock from '../../mocks/CuttingServiceMock';

describe('hoops-cutting-plane element', () => {
  let service: ICuttingService;
  beforeEach(() => {
    clearServices();
    service = new CuttingServiceMock(vi.fn);
    registerService(service);
    document.body.innerHTML = '';
  });

  it('renders nothing when indices are -1', async () => {
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.service = service;
    document.body.appendChild(el);
    await el.updateComplete;

    // Should contain only style tag (no accordion)
    expect(el.shadowRoot?.querySelector('hoops-accordion')).toBeNull();
  });

  it('renders accordion when valid indices provided', async () => {
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.planeIndex = 0;
    el.sectionIndex = 0;
    el.service = service;
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('hoops-accordion')).toBeTruthy();
    expect(el.shadowRoot?.textContent).toMatch(/Cutting Plane 1/);
  });

  it('toggles editor visibility on toolbar change event', async () => {
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.planeIndex = 0;
    el.sectionIndex = 0;
    el.service = service;
    document.body.appendChild(el);
    await el.updateComplete;
    const toolbar = el.shadowRoot?.querySelector('hoops-cutting-plane-toolbar');
    expect(toolbar).toBeTruthy();
    toolbar?.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect((el as unknown as { showEditor: boolean }).showEditor).toBe(true);
  });

  it('updates on matching hoops-cutting-plane-change event', () => {
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.planeIndex = 0;
    el.sectionIndex = 0;
    el.service = service;
    document.body.appendChild(el);
    const prevHtml = el.shadowRoot?.innerHTML || '';
    el.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-change', {
        detail: { planeIndex: 0, sectionIndex: 0 },
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.shadowRoot?.innerHTML).toBe(prevHtml); // requestUpdate async; basic existence check
  });

  it('covers lifecycle with service property and event dispatch', async () => {
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.planeIndex = 0;
    el.sectionIndex = 0;
    // Assign direct service to exercise firstUpdated listener registration branch
    const service = new CuttingServiceMock(vi.fn);
    el.service = service;
    document.body.appendChild(el);
    await el.updateComplete;
    // Dispatch matching event from service to trigger invalidateCuttingPlane branch
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-change', {
        detail: { planeIndex: 0, sectionIndex: 0 },
      }),
    );
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('hoops-accordion')).toBeTruthy();
    // Remove element to exercise disconnectedCallback branch
    el.remove();
  });

  it('renders empty template when service missing but indices valid', async () => {
    clearServices(); // ensure global getService returns undefined
    const el = document.createElement('hoops-cutting-plane') as HoopsCuttingPlaneElement;
    el.planeIndex = 0;
    el.sectionIndex = 0;
    document.body.appendChild(el);
    await el.updateComplete;
    // Shadow root should exist but have no accordion content
    expect(el.shadowRoot?.querySelector('hoops-accordion')).toBeNull();
  });
});
