import type { Meta, StoryObj } from '@storybook/web-components';

import './hoops-list';
import { html } from 'lit';
import List from './hoops-list';
import { ContextWrapper } from './context';

import './hoops-list-element';
import './hoops-list';

const meta: Meta = {
  component: 'hoops-list',
};

export default meta;
type Story = StoryObj;

export const Base: Story = {
  args: {},
  render: () => {
    return html`<hoops-list></hoops-list>`;
  },
};

export const WithCustomData: Story = {
  ...Base,
};

const testData = {
  elementsData: new Map<number, string>([
    [0, 'B element'],
    [1, 'A element'],
    [3, 'C element'],
  ]),
  getContent(key: number) {
    return html`${key} - ${this.elementsData?.get(key)}`;
  },
};

const defaultTestContext: ContextWrapper = {
  context: {
    elementsData: testData.elementsData,
    sortedByValue: false,
    getContent: (_context, key, _selected?) => testData.getContent(key),
  },
};

WithCustomData.play = async ({ canvasElement }) => {
  const list = canvasElement.getElementsByTagName('hoops-list')[0] as List;
  list.list = defaultTestContext;
};

export const WithSelected: Story = {
  ...Base,
};

WithSelected.play = async ({ canvasElement }) => {
  const list = canvasElement.getElementsByTagName('hoops-list')[0] as List;
  list.selected = [0, 3];
  list.list = defaultTestContext;
  list.addEventListener('hoops-list-element-click', (event) => {
    if (list.selected.includes(event.detail.key)) {
      const index = list.selected.indexOf(event.detail.key);
      delete list.selected[index];
    } else {
      list.selected.push(event.detail.key);
    }
    list.updateSelected();
  });
};

export const SortedByValue: Story = {
  ...Base,
};

SortedByValue.play = async ({ canvasElement }) => {
  const list = canvasElement.getElementsByTagName('hoops-list')[0] as List;
  list.list = {
    context: {
      sortedByValue: true,
      getContent: (_context, key, _selected) => testData.getContent(key),
      elementsData: testData.elementsData,
    },
  };
  list.list.context.sortedByValue = true;
};
