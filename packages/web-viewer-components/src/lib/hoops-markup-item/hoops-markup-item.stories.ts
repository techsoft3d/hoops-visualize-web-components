import { Meta, StoryObj } from '@storybook/web-components';
import { html, nothing } from 'lit';
import '@ts3d-hoops/ui-kit';

import '../hoops-tools-panel/hoops-tools-markup-group';
import './hoops-markup-item';
import { ifDefined } from 'lit-html/directives/if-defined.js';

const meta: Meta = {
  component: 'hoops-markup-item',
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  argTypes: {
    markupId: {
      control: 'text',
      description: 'The unique identifier for the markup item',
      defaultValue: '1234-5674-9876-5432',
    },
    label: {
      control: 'text',
      description: 'The label for the markup item',
      defaultValue: 'Markup Item',
    },
    selected: {
      control: 'boolean',
      description: 'Indicates if the markup item is selected',
      defaultValue: false,
    },
    icon: {
      control: 'select',
      description: 'The icon to display in the markup item',
      options: ['note', 'redlineCircle', 'redlineFreehand', 'redlineRectangle', 'redlineNote'],
    },
    toolbar: {
      control: 'object',
      description: 'The toolbar items to display in the markup item',
    },
  },
  render: (args) => {
    return html`<hoops-markup-item markupId=${ifDefined(args.markupId)} ?selected=${args.selected}>
      ${args.icon
        ? html`<hoops-icon
            class="icon"
            icon=${args.icon}
            slot="icon"
            style="width: 100%"
          ></hoops-icon>`
        : nothing}
      ${args.label}
      ${!args.toolbar
        ? nothing
        : html`<div class="toolbar" slot="toolbar">
            ${args.toolbar.map(
              (toolbarItem: string) =>
                html`<hoops-icon-button
                  ><hoops-icon icon=${toolbarItem}></hoops-icon
                ></hoops-icon-button>`,
            )}
          </div>`}
    </hoops-markup-item>`;
  },
};

export const WithLabel: Story = {
  ...Empty,
  args: {
    markupId: '1234-5674-9876-5432',
    label: 'Markup Item with Label',
  },
};

export const WithIcon: Story = {
  ...Empty,
  args: {
    markupId: '1234-5674-9876-5432',
    icon: 'note',
  },
};

export const WithTooolbar: Story = {
  ...Empty,
  args: {
    markupId: '1234-5674-9876-5432',
    toolbar: ['removeIcon'],
  },
};

export const WithIconAndLabel: Story = {
  ...Empty,
  args: {
    markupId: '1234-5674-9876-5432',
    icon: 'note',
    label: 'Markup Item with Icon and Label',
  },
};

export const WithIconAndLabelAndToolbar: Story = {
  ...Empty,
  args: {
    markupId: '1234-5674-9876-5432',
    icon: 'note',
    label: 'Markup Item with Icon and Label',
    toolbar: ['removeIcon'],
  },
};
