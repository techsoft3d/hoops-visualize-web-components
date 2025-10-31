import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit-html/directives/if-defined.js';
import { expect, fn, userEvent, waitFor } from '@storybook/test';

import './switch';

const meta: Meta = {
  component: 'hoops-switch',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  argTypes: {
    checked: {
      control: 'boolean',
      description: "The switch's state",
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      description: 'Whether or not the switch is disabled',
      defaultValue: false,
    },
    label: {
      control: 'text',
      description: "The switch's label",
      defaultValue: 'Label',
    },
  },
  render: (args) => {
    return html`<div style="height: 4rem;">
      <hoops-switch
        ?checked=${args.checked}
        ?disabled=${args.disabled}
        label=${ifDefined(args.label)}
      ></hoops-switch>
    </div>`;
  },
};

export const Checked: Story = { ...Base, args: { checked: true } };

export const Disabled: Story = { ...Base, args: { disabled: true } };

export const CheckedDisabled: Story = { ...Base, args: { checked: true, disabled: true } };

export const WithLabel: Story = { ...Base, args: { label: 'label' } };

export const EventTest: Story = {
  ...Base,
  play: async ({ canvasElement }) => {
    const switchElement = canvasElement.querySelector('hoops-switch') as HTMLElement;
    const onChange = fn();
    switchElement.addEventListener('change', onChange);
    await userEvent.click(switchElement.shadowRoot!.querySelector('label')!);
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    onChange.mockClear();
    userEvent.type(switchElement.shadowRoot!.querySelector('label')!, '{space}');
    await waitFor(() => expect(onChange).toHaveBeenCalled());
  },
};
