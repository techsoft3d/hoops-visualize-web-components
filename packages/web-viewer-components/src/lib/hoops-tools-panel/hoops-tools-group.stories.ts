import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-tools-group';

const meta: Meta = {
  component: 'hoops-tools-group',
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  argTypes: {
    label: {
      control: 'text',
      description: 'The label for the group',
      defaultValue: 'Group Label',
    },
  },
  render: (args) => {
    return html`<hoops-tools-group label=${args.label}>
      lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </hoops-tools-group>`;
  },
};

export const WithLabel: Story = {
  ...Empty,
  render: (args) => {
    return html`<hoops-tools-group label=${args.label ?? 'Tools Group'}>
      lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </hoops-tools-group>`;
  },
};

export const WithToolbar: Story = {
  ...Empty,
  render: (args) => {
    return html`<hoops-tools-group label=${args.label ?? 'Tools Group'}>
      <div slot="toolbar">
        <hoops-icon-button @click=${() => console.log('home clicked')}>
          <hoops-icon icon="home"></hoops-icon>
        </hoops-icon-button>
        <hoops-icon-button @click=${() => console.log('explode clicked')}>
          <hoops-icon icon="explode"></hoops-icon>
        </hoops-icon-button>
      </div>
      lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </hoops-tools-group>`;
  },
};
