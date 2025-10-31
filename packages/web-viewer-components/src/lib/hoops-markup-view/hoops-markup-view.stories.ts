import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit-html/directives/if-defined.js';

import { RedlineServiceMock } from '../../mocks/RedlineServiceMock';

import './hoops-markup-view';
import { getService } from '../services';

const meta: Meta = {
  component: 'hoops-markup-view',
  tags: ['RedlineService', 'RedlineServicePanel'],
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  argTypes: {
    expanded: {
      control: 'boolean',
      description: 'Whether the markup view is expanded or not. Defaults to false.',
    },
    selected: {
      control: 'boolean',
      description: 'Whether the markup view is selected or not. Defaults to false.',
    },
    uuid: {
      control: 'text',
      description: 'The UUID of the markup view. If not provided, it will render an empty view.',
    },
  },
  render: (args) => {
    const redlineService = getService<RedlineServiceMock>('RedlineService')!;

    return html`<hoops-markup-view
      .redlineService=${redlineService as any}
      ?expanded=${args.expanded}
      ?selected=${args.selected}
      uuid=${ifDefined(args.uuid)}
      @hoops-delete-markup=${(e: CustomEvent) => {
        redlineService.fireRedlineDeletedEvent({
          markupViewId: '1234-5678-9012-3456',
          markup: e.detail.markupItem,
        });
      }}
    ></hoops-markup-view>`;
  },
};

export const Basic: Story = {
  ...Empty,
  args: {
    expanded: true,
    selected: false,
    uuid: '1234-5678-9012-3456',
  },
};
