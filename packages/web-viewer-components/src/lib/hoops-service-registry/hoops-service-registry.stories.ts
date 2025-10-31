import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './hoops-service-registry';
import { IRedlineService, RedlineService, tryGetService } from '../services';
import { expect } from '@storybook/test';
import HoopsServiceRegistryElement from './hoops-service-registry';

const meta: Meta = {
  component: 'hoops-service-registry',
};

export default meta;
type Story = StoryObj;

export const Empty: Story = {
  render: () => {
    return html`<hoops-service-registry>
      lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
      laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
      voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
      non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </hoops-service-registry>`;
  },

  play: async ({ canvasElement }) => {
    const registry = canvasElement.querySelector(
      'hoops-service-registry',
    )! as unknown as HoopsServiceRegistryElement;
    await registry.updateComplete;

    await registry.updateComplete;
    const service = registry.tryGetService<IRedlineService>('RedlineService');
    expect(service).toBeDefined();
    expect(service instanceof RedlineService).toBeTruthy();
    expect(service).toBe(tryGetService('RedlineService'));
    expect(registry.tryGetService('NonExistentService')).toBeUndefined();
  },
};
