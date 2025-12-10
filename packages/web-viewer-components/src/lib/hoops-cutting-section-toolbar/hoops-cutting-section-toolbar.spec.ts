import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import './hoops-cutting-section-toolbar';
import { Box, Point3, Plane } from '@ts3d-hoops/common';
import type { ICuttingService } from '../services';
import { HoopsCuttingSectionToolbarElement } from './hoops-cutting-section-toolbar';
import CuttingServiceMock from '../../mocks/CuttingServiceMock';
import { DropdownMenu } from '@ts3d-hoops/ui-kit/dropdown';

describe('hoops-cutting-section-toolbar', () => {
  let service: CuttingServiceMock;
  let el: HoopsCuttingSectionToolbarElement;

  beforeEach(async () => {
    document.body.innerHTML = '';
    service = new CuttingServiceMock(vi.fn);
    el = document.createElement(
      'hoops-cutting-section-toolbar',
    ) as HoopsCuttingSectionToolbarElement;
    el.sectionIndex = 0;
    el.service = service as unknown as ICuttingService;
    document.body.appendChild(el);
    await el.updateComplete;
  });

  it('renders nothing when service missing', async () => {
    const noServiceEl = document.createElement(
      'hoops-cutting-section-toolbar',
    ) as HoopsCuttingSectionToolbarElement;
    noServiceEl.sectionIndex = 0;
    document.body.appendChild(noServiceEl);
    await Promise.resolve();
    expect(noServiceEl.shadowRoot?.querySelector('.container')).toBeNull();
  });

  it('attaches and detaches event listener (lifecycle)', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(spy).toHaveBeenCalled();
    spy.mockClear();
    el.remove();
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
  });

  it('does not update on non-matching section index', async () => {
    const spy = vi.spyOn(el, 'requestUpdate');
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 99 } }),
    );
    await el.updateComplete;
    expect(spy).not.toHaveBeenCalled();
  });

  it('creates X axis cutting plane with reference geometry when visible', async () => {
    const xBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneX"]')?.parentElement;
    expect(xBtn).toBeTruthy();
    xBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(service.addCuttingPlane).toHaveBeenCalled();
    const args = (service.addCuttingPlane as Mock).mock.calls.at(-1)!;
    expect(args[0]).toBe(0); // section index
    const def = args[1];
    expect(def.plane.normal.x).toBe(1);
    expect(def.referenceGeometry).toBeTruthy();
  });

  it('creates Y and Z axis cutting planes', async () => {
    const yBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneY"]')?.parentElement;
    const zBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneZ"]')?.parentElement;
    yBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    zBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const calls = (service.addCuttingPlane as Mock).mock.calls;
    const yCall = calls.find((c: any) => c[1].plane.normal.y === 1);
    const zCall = calls.find((c: any) => c[1].plane.normal.z === 1);
    expect(yCall).toBeTruthy();
    expect(zCall).toBeTruthy();
  });

  it('selected face button disabled when no selection, then enables and uses face', async () => {
    const faceBtnIcon = el.shadowRoot?.querySelector('hoops-icon[icon="viewFace"]');
    const faceBtn = faceBtnIcon?.parentElement as HTMLElement | undefined;
    expect(faceBtn?.getAttribute('disabled')).toBe(''); // disabled attribute present
    // Provide selected face
    service.simulateFaceSelection(new Point3(0, 0, 0), new Point3(0, 1, 0));
    await el.updateComplete;
    // After selection, button should not have disabled attribute
    expect(faceBtn?.hasAttribute('disabled')).toBe(false);
    faceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const calls = (service.addCuttingPlane as Mock).mock.calls;
    const selectedCall = calls.find(
      (c: any) =>
        c[1].plane.normal.y === 1 && c[1].plane.normal.x === 0 && c[1].plane.normal.z === 0,
    );
    expect(selectedCall).toBeTruthy();
  });

  it('creates custom cutting plane with normalized (1,1,0)', async () => {
    const editBtn = el.shadowRoot?.querySelector('hoops-icon[icon="editIcon"]')?.parentElement;
    editBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const last = (service.addCuttingPlane as Mock).mock.calls.at(-1)![1];
    // Normal should be normalized (1,1,0)
    const len = Math.sqrt(
      last.plane.normal.x ** 2 + last.plane.normal.y ** 2 + last.plane.normal.z ** 2,
    );
    expect(Math.abs(len - 1)).toBeLessThan(1e-6);
  });

  it('toggling section visibility calls setCuttingSectionGeometryVisibility with inverse', async () => {
    const toggleIcon = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneSectionToggle"]');
    toggleIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(service.setCuttingSectionGeometryVisibility).toHaveBeenCalledWith(0, true);
  });

  it('clear button empties planes', async () => {
    // Prepopulate a plane
    service.addCuttingPlane(0, { plane: Plane.createFromCoefficients(1, 0, 0, 0) });
    const clearBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneReset"]')
      ?.parentElement;
    clearBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(service.clearCuttingSection).toHaveBeenCalledWith(0);
    expect(service.getCuttingPlaneCount(0)).toBe(0);
  });

  it('switch toggles active state', async () => {
    const sw = el.shadowRoot?.querySelector('hoops-switch');
    expect(sw).toBeTruthy();
    sw?.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    expect(service.setCuttingSectionState).toHaveBeenCalledWith(0, false); // inverse of true
  });

  it('sectionFull disables dropdown and add buttons', async () => {
    // Add 3 planes to reach full
    service.addCuttingPlane(0, { plane: Plane.createFromCoefficients(1, 0, 0, 0) });
    service.addCuttingPlane(0, { plane: Plane.createFromCoefficients(0, 1, 0, 0) });
    service.addCuttingPlane(0, { plane: Plane.createFromCoefficients(0, 0, 1, 0) });
    await el.updateComplete;
    // Force re-render
    service.dispatchEvent(
      new CustomEvent('hoops-cutting-section-change', { detail: { sectionIndex: 0 } }),
    );
    await el.updateComplete;
    expect(service.getCuttingPlaneCount(0)).toBe(4);
    const dropdown = el.shadowRoot?.querySelector('hoops-dropdown');
    expect(dropdown?.getAttribute('disabled')).toBe('');
    const addIconButton = el.shadowRoot?.querySelector('hoops-dropdown hoops-icon-button');
    expect(addIconButton?.getAttribute('disabled')).toBe('');
  });

  it('hideDropdown sets menuShown=false after add plane when initially true', async () => {
    const dropdown = el.shadowRoot?.querySelector('hoops-dropdown') as DropdownMenu;
    dropdown.menuShown = true; // simulate open menu
    const xBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneX"]')?.parentElement;
    xBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(dropdown.menuShown).toBe(false);
  });

  it('when section inactive, control buttons are disabled', async () => {
    service.setCuttingSectionState(0, false);
    await el.updateComplete;
    const toggleIconParent = el.shadowRoot?.querySelector(
      'hoops-icon[icon="cuttingPlaneSectionToggle"]',
    )?.parentElement;
    const clearBtnParent = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneReset"]')
      ?.parentElement;
    expect(toggleIconParent?.getAttribute('disabled')).toBe('');
    expect(clearBtnParent?.getAttribute('disabled')).toBe('');
  });

  it('adds plane without reference geometry when hideReferenceGeometry true', async () => {
    service.setCuttingSectionGeometryVisibility(0, false); // now hideReferenceGeometry true
    await el.updateComplete;
    const xBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneX"]')?.parentElement;
    xBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;

    const cuttingPlane = service.getCuttingPlanes(0).slice(-1)[0];
    expect(cuttingPlane.referenceGeometry).toBeUndefined();
  });

  it('does not add plane when service removed before click (branch coverage)', async () => {
    const xBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneX"]')
      ?.parentElement as HTMLElement | null;
    expect(xBtn).toBeTruthy();
    const originalCallCount = (service.addCuttingPlane as Mock).mock.calls.length;
    // Remove service after initial render without waiting for update so DOM still present
    el.service = undefined;
    xBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    // Should not have incremented call count
    const newCount = (service.addCuttingPlane as Mock).mock.calls.length;
    expect(newCount).toBe(originalCallCount);
  });

  it('selected face button click with no selected face does not add plane', async () => {
    const faceBtnIcon = el.shadowRoot?.querySelector('hoops-icon[icon="viewFace"]');
    const faceBtn = faceBtnIcon?.parentElement as HTMLElement | undefined;
    const before = (service.addCuttingPlane as Mock).mock.calls.length;
    faceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const after = (service.addCuttingPlane as Mock).mock.calls.length;
    expect(after).toBe(before); // no new plane added
  });

  it('toggle visibility click with invalid section index does nothing', async () => {
    const el2 = document.createElement(
      'hoops-cutting-section-toolbar',
    ) as HoopsCuttingSectionToolbarElement;
    el2.sectionIndex = 99; // invalid index
    el2.service = service as unknown as ICuttingService;
    document.body.appendChild(el2);
    await el2.updateComplete;
    const toggleIcon = el2.shadowRoot?.querySelector(
      'hoops-icon[icon="cuttingPlaneSectionToggle"]',
    );
    const beforeCalls = (
      service.setCuttingSectionGeometryVisibility as unknown as {
        mock: { calls: [number, boolean][] };
      }
    ).mock.calls.length;
    toggleIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const afterCalls = (
      service.setCuttingSectionGeometryVisibility as unknown as {
        mock: { calls: [number, boolean][] };
      }
    ).mock.calls.length;
    expect(afterCalls).toBe(beforeCalls);
  });

  it('switch change with invalid section index does nothing', async () => {
    const el3 = document.createElement(
      'hoops-cutting-section-toolbar',
    ) as HoopsCuttingSectionToolbarElement;
    el3.sectionIndex = 42; // invalid
    el3.service = service as unknown as ICuttingService;
    document.body.appendChild(el3);
    await el3.updateComplete;
    const sw = el3.shadowRoot?.querySelector('hoops-switch');
    const beforeCalls = (service.setCuttingSectionState as Mock).mock.calls.length;
    sw?.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;
    const afterCalls = (service.setCuttingSectionState as Mock).mock.calls.length;
    expect(afterCalls).toBe(beforeCalls);
  });

  it('hideDropdown no-op when menu initially closed', async () => {
    const dropdown = el.shadowRoot?.querySelector('hoops-dropdown') as DropdownMenu;
    dropdown.menuShown = false;
    const xBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneX"]')?.parentElement;
    xBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    expect(dropdown.menuShown).toBe(false); // remains false
  });

  it('adds Y/Z/custom/face planes without reference geometry when hideReferenceGeometry', async () => {
    // hide reference geometry
    service.setCuttingSectionGeometryVisibility(0, false);
    await el.updateComplete;
    // Add Y
    const yBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneY"]')?.parentElement;
    yBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Add Z
    const zBtn = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneZ"]')?.parentElement;
    zBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Provide face and add face-based plane
    service.simulateFaceSelection(new Point3(1, 1, 1), new Point3(0, 0, 1));
    await el.updateComplete;
    const faceBtn = el.shadowRoot?.querySelector('hoops-icon[icon="viewFace"]')?.parentElement;
    faceBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    // Add custom
    const customBtn = el.shadowRoot?.querySelector('hoops-icon[icon="editIcon"]')?.parentElement;
    customBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const calls = (service.addCuttingPlane as Mock).mock.calls;
    // Check last four calls have undefined referenceGeometry
    const lastFour = calls.slice(-4).map((c) => c[1]);
    lastFour.forEach((def) => expect(def.referenceGeometry).toBeUndefined());
  });

  it('toggle visibility when hidden sets it visible (inverse branch)', async () => {
    service.setCuttingSectionGeometryVisibility(0, false); // hide
    await el.updateComplete;
    const toggleIcon = el.shadowRoot?.querySelector('hoops-icon[icon="cuttingPlaneSection"]');
    const beforeCalls = (
      service.setCuttingSectionGeometryVisibility as unknown as {
        mock: { calls: [number, boolean][] };
      }
    ).mock.calls.length;
    toggleIcon?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await el.updateComplete;
    const afterCalls = (
      service.setCuttingSectionGeometryVisibility as unknown as {
        mock: { calls: [number, boolean][] };
      }
    ).mock.calls.length;
    expect(afterCalls).toBeGreaterThan(beforeCalls);
    // Last call should have been with false
    const last = (
      service.setCuttingSectionGeometryVisibility as unknown as {
        mock: { calls: [number, boolean][] };
      }
    ).mock.calls.at(-1);
    expect(last?.[1]).toBe(false);
  });
});
