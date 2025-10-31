import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-markup-tree';
import { RedlineServiceMock } from '../../mocks/RedlineServiceMock';
import { getService } from '../services';

const meta: Meta = {
  component: 'hoops-markup-tree',
  tags: ['RedlineService', 'RedlineServicePanel'],
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  args: {
    expanded: true,
    selected: false,
  },
  render: () => {
    const redlineService = getService<RedlineServiceMock>('RedlineService')!;

    return html`<hoops-markup-tree
      .redlineService=${redlineService}
      style="flex-grow: 1"
    ></hoops-markup-tree>`;
  },
};
