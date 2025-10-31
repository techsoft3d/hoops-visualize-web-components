import { html } from 'lit';
import { describe, expect, it } from 'vitest';
import { renderTemplate, tick } from '../testing/utils';
import './hoops-layout';
import HoopsLayout from './hoops-layout';

describe('hoops-layout', () => {
  it('Only the slot included in the component are getting displayed', async () => {
    await renderTemplate(html` <hoops-layout><div slot="menu-bar"></div></hoops-layout> `);
    const layout = document.querySelector('hoops-layout')!.shadowRoot!;

    const renderedSlots = Array.from(layout.querySelectorAll('[aria-hidden=false]'));
    expect(renderedSlots?.length).toBe(1);
  });

  it('hideSlot hides a component to the user', async () => {
    await renderTemplate(html` <hoops-layout><div slot="menu-bar"></div></hoops-layout> `);
    const layout: HoopsLayout = document.querySelector('hoops-layout')!;
    const layoutShadowRoot = document.querySelector('hoops-layout')!.shadowRoot!;

    const slot = layoutShadowRoot.querySelector('[name=menu-bar]')!;
    expect(slot.getAttribute('aria-hidden')).toEqual('false');

    layout.hideSlot('menu-bar');
    await tick();

    expect(slot.getAttribute('aria-hidden')).toEqual('true');
  });
});
