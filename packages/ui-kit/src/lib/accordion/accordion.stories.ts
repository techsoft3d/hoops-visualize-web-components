import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './accordion';
import { expect, fn, userEvent, waitFor } from '@storybook/test';

const meta: Meta = {
  component: 'hoops-accordion',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  argTypes: {
    expanded: {
      control: 'boolean',
      description: "The accordion's state",
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether or not the accordion is disabled',
      defaultValue: false,
    },
  },
  render: (args) => {
    return html`<div style="height: 4rem;">
      <hoops-accordion ?expanded=${args.expanded} ?disabled=${args.disabled}>
        <div slot="header">Accordion Header</div>
        <div slot="content">Accordion Content</div>
      </hoops-accordion>
    </div>`;
  },
};

export const Expanded: Story = { ...Base, args: { expanded: true } };

export const Disabled: Story = { ...Base, args: { disabled: true } };

export const ExpandedDisabled: Story = { ...Base, args: { expanded: true, disabled: true } };

export const EventTest: Story = {
  ...Base,
  play: async ({ canvasElement }) => {
    const accordionElement = canvasElement.querySelector('hoops-accordion') as HTMLElement;

    const accordionHeader = accordionElement.shadowRoot!.querySelector(
      'slot[name="header"]',
    ) as HTMLElement;

    const onChange = fn();
    accordionElement.addEventListener('change', onChange);
    await userEvent.click(accordionHeader!);
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    onChange.mockClear();
    userEvent.type(accordionHeader, '{space}');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  },
};
