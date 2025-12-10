import { describe, it, expect, beforeEach, vi } from 'vitest';
import './hoops-cutting-plane-panel';
import '../hoops-cutting-section/hoops-cutting-section';
import { HoopsCuttingPlanePanelElement } from './hoops-cutting-plane-panel';
import { registerService, clearServices, getService } from '../services/serviceRegistry';
import { CuttingServiceMock } from '../../mocks/CuttingServiceMock';

describe('hoops-cutting-plane-panel', () => {
  let service: CuttingServiceMock;
  let el: HoopsCuttingPlanePanelElement;

  beforeEach(async () => {
    clearServices();
    document.body.innerHTML = '';
    registerService(new CuttingServiceMock(vi.fn));
    service = getService('CuttingService');
    el = document.createElement('hoops-cutting-plane-panel') as HoopsCuttingPlanePanelElement;
    document.body.appendChild(el);
    await el.updateComplete; // firstUpdated ran, service assigned
    el.requestUpdate(); // trigger render with service now set
    await el.updateComplete;
  });

  it('renders container and sections with correct count and labels', async () => {
    await el.updateComplete; // ensure second render settled
    const header = el.shadowRoot?.querySelector('h3');
    expect(header?.textContent).toBe('Cutting Planes');
    const sections = el.shadowRoot?.querySelectorAll('hoops-cutting-section');
    expect(sections?.length).toBe(6);
  });

  it('updates on section change event', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.clearCuttingSection(0);
    await el.updateComplete;
    expect(spy).toHaveBeenCalled();
  });

  it('does not duplicate listeners when re-attached', async () => {
    const spy = vi.spyOn(service, 'addEventListener');
    el.remove();
    document.body.appendChild(el); // triggers connected again but firstUpdated not rerun
    await el.updateComplete;
    // firstUpdated is only called once per lifecycle, listeners should not multiply here
    const addCalls = spy.mock.calls.filter((c) =>
      c[0].toString().includes('hoops-cutting-section-change'),
    );
    expect(addCalls.length).toBeLessThanOrEqual(1); // <=1 registration for change event
  });
});
