import type { Meta, StoryObj } from '@storybook/web-components';
import { expect } from '@storybook/test';

import {
  hoopsWebViewerComponentArgsType,
  renderHoopsWebViewerComponent,
  waitForHwvEvent,
} from '../stories/sb-utils';

import WebViewer from './hoops-web-viewer';
import './hoops-web-viewer';

const meta: Meta<WebViewer> = {
  title: 'lib/hoops-web-viewer',
  component: 'hoops-web-viewer',
  render: renderHoopsWebViewerComponent,
  argTypes: hoopsWebViewerComponentArgsType,
};

export default meta;
type Story = StoryObj<WebViewer>;

export const Primary: Story = {
  args: {
    endpointUri: '/datasets/FUNCTIONAL-TESTS/microengine.scs',
  },
};

Primary.play = async ({ canvasElement }) => {
  const elm = canvasElement.getElementsByTagName('hoops-web-viewer')[0] as HTMLElement;
  const event = await waitForHwvEvent(elm, 'hwvModelStructureReady', {
    timeout: 15000,
  });
  const { hwv } = event.detail;

  expect(hwv._getScEngine().isInit()).toBeTruthy();
};
