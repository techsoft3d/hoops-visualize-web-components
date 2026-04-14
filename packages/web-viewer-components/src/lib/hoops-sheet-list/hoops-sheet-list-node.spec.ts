import { html } from 'lit';
import { describe, expect, it } from 'vitest';

import { renderTemplate } from '../testing/utils';
import './hoops-sheet-list-node';
import { SheetListNode } from './hoops-sheet-list-node';

describe('hoops-sheet-list-node', () => {
  it('should render with a name and nodeId', async () => {
    await renderTemplate(
      html`<hoops-sheet-list-node nodeId="10" nodeName="Sheet 1"></hoops-sheet-list-node>`,
    );
    const node = document.querySelector('hoops-sheet-list-node') as SheetListNode;
    await node.updateComplete;

    expect(node).toBeTruthy();
    expect(node.nodeId).toBe(10);
    expect(node.nodeName).toBe('Sheet 1');
  });

  it('should render nothing when nodeId is NaN', async () => {
    await renderTemplate(html`<hoops-sheet-list-node></hoops-sheet-list-node>`);
    const node = document.querySelector('hoops-sheet-list-node') as SheetListNode;
    await node.updateComplete;

    const shadow = node.shadowRoot!;
    expect(shadow.querySelector('.sheet-list-node')).toBeNull();
  });

  it('should apply the selected class when selected', async () => {
    await renderTemplate(
      html`<hoops-sheet-list-node nodeId="10" nodeName="Sheet 1" selected></hoops-sheet-list-node>`,
    );
    const node = document.querySelector('hoops-sheet-list-node') as SheetListNode;
    await node.updateComplete;

    const div = node.shadowRoot!.querySelector('.sheet-list-node');
    expect(div?.classList.contains('selected')).toBe(true);
  });

  it('should not apply the selected class when not selected', async () => {
    await renderTemplate(
      html`<hoops-sheet-list-node nodeId="10" nodeName="Sheet 1"></hoops-sheet-list-node>`,
    );
    const node = document.querySelector('hoops-sheet-list-node') as SheetListNode;
    await node.updateComplete;

    const div = node.shadowRoot!.querySelector('.sheet-list-node');
    expect(div?.classList.contains('selected')).toBe(false);
  });
});
