import type { Meta, StoryObj } from '@storybook/web-components';

import { html } from 'lit';
import HoopsCadConfigurationListElement from './hoops-cad-configuration-list';

import './hoops-cad-configuration-list';

const meta: Meta = {
  component: 'hoops-cad-configuration-list',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html` <hoops-cad-configuration-list></hoops-cad-configuration-list>`;
  },
};

const model = {
  getCadConfigurations: () => {
    console.log('getCadConfigurations');
    return {
      2: 'dumper',
      3: 'trailer truck',
      4: 'truck only',
    };
  },
};

Base.play = ({ canvasElement }) => {
  const cadConfigurationList = canvasElement.getElementsByTagName(
    'hoops-cad-configuration-list',
  )[0] as HoopsCadConfigurationListElement;
  console.log('Give model');
  cadConfigurationList.model = model;

  cadConfigurationList.addEventListener('hoops-cad-configuration-list-click', (event) => {
    cadConfigurationList.active = event.detail.cadConfigurationId;
  });
  cadConfigurationList.active = 3;
};
