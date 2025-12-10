import { describe, it, expect, beforeEach, vi } from 'vitest';
import './hoops-cutting-section';
import '../hoops-cutting-section-toolbar';
import type { ICuttingService } from '../services';
import { Plane } from '@ts3d-hoops/common';
import { HoopsCuttingSectionElement } from './hoops-cutting-section';
import CuttingServiceMock from '../../mocks/CuttingServiceMock';

describe('hoops-cutting-section', () => {
  let service: ICuttingService;
  let el: HoopsCuttingSectionElement;

  beforeEach(async () => {
    document.body.innerHTML = '';
    service = new CuttingServiceMock(vi.fn);
    el = document.createElement('hoops-cutting-section') as HoopsCuttingSectionElement;
    el.sectionIndex = 0;
    el.label = 'Section A';
    el.service = service as unknown as ICuttingService;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  it('renders nothing without service', async () => {
    const noSvc = document.createElement('hoops-cutting-section') as HoopsCuttingSectionElement;
    noSvc.sectionIndex = 0;
    document.body.appendChild(noSvc);
    await noSvc.updateComplete;
    // Should not render an accordion when service missing
    expect(noSvc.shadowRoot?.querySelector('hoops-accordion')).toBeNull();
  });

  it('renders nothing when section not found', async () => {
    el.sectionIndex = -1; // invalid index -> getCuttingSection returns undefined
    await el.requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('hoops-accordion')).toBeNull();
  });

  it('renders accordion with label and plane children', () => {
    const acc = el.shadowRoot?.querySelector('hoops-accordion');
    expect(acc).toBeTruthy();
    const headerText = el.shadowRoot?.querySelector('.header div')?.textContent?.trim();
    expect(headerText).toBe('Section A');
    const planes = el.shadowRoot?.querySelectorAll('hoops-cutting-plane');
    // CuttingServiceMock default section 0 has 1 plane
    expect(planes?.length).toBe(1);
  });

  it('not expanded by default and expands on cutting plane added event for same section', async () => {
    expect(el.expanded).toBe(false);
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-added', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(el.expanded).toBe(true);
  });

  it('does not expand when plane added for different section', async () => {
    expect(el.expanded).toBe(false);
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-added', { detail: { sectionIndex: 1 } }),
    );
    await el.updateComplete;
    expect(el.expanded).toBe(false);
  });

  it('requestUpdate called for matching section change / reset / plane removed', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-service-reset', { detail: { sectionIndex: 0 } }),
    );
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 0 } }),
    );
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-removed', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it('requestUpdate not called for non-matching events', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 99 } }),
    );
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-removed', { detail: { sectionIndex: 2 } }),
    );
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-added', { detail: { sectionIndex: 3 } }),
    );
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
  });

  it('listener attachment occurs only when service defined (using CuttingServiceMock)', async () => {
    const mock = new CuttingServiceMock(vi.fn);
    const addSpy = vi.spyOn(mock, 'addEventListener');
    const tmp = document.createElement('hoops-cutting-section') as HoopsCuttingSectionElement;
    tmp.sectionIndex = 0;
    tmp.service = mock as ICuttingService;
    document.body.appendChild(tmp);
    await tmp.updateComplete;
    expect(addSpy.mock.calls.length).toBeGreaterThanOrEqual(4);
    tmp.remove();
  });

  it('does not throw when events fired without service (early return branches)', async () => {
    const orphan = document.createElement('hoops-cutting-section') as HoopsCuttingSectionElement;
    orphan.sectionIndex = 0;
    document.body.appendChild(orphan);
    await orphan.updateComplete;
    // Fire events directly (service missing so no listeners actually bound). Should be no errors.
    expect(() => orphan.dispatchEvent(new Event('hoops-cutting-plane-added'))).not.toThrow();
  });

  it('invalidateSection only updates matching sectionIndex', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 1 } }),
    );
    await el.updateComplete;
    const callsAfterNonMatch = spy.mock.calls.length;
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(spy.mock.calls.length).toBeGreaterThan(callsAfterNonMatch);
  });

  it('handleCuttingPlaneAdded only expands for matching section', async () => {
    el.expanded = false;
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-added', { detail: { sectionIndex: 1 } }),
    );
    await el.updateComplete;
    expect(el.expanded).toBe(false);
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-plane-added', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(el.expanded).toBe(true);
  });
});
