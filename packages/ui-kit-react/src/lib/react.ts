import React from 'react';

import { createComponent } from '@lit/react';

import {
  button,
  common,
  dropdown,
  icons,
  iconButton,
  layout,
  nodeProperties,
  toolbar,
  hoopsSwitch,
  accordion,
} from '@ts3d-hoops/ui-kit';

export const HoopsLayout = createComponent({
  tagName: 'hoops-layout',
  elementClass: layout.HoopsLayout,
  react: React,
});

export const HoopsToolbar = createComponent({
  tagName: 'hoops-toolbar',
  elementClass: toolbar.Toolbar,
  react: React,
});

export const HoopsSeparator = createComponent({
  tagName: 'hoops-separator',
  elementClass: common.Separator,
  react: React,
});

export const HoopsButton = createComponent({
  tagName: 'hoops-button',
  elementClass: button.HoopsButton,
  react: React,
});

export const HoopsIconButton = createComponent({
  tagName: 'hoops-icon-button',
  elementClass: iconButton.HoopsIconButton,
  react: React,
});

export const HoopsNodeProperties = createComponent({
  tagName: 'hoops-node-properties',
  elementClass: nodeProperties.NodeProperties,
  react: React,
});

export const HoopsDropdown = createComponent({
  tagName: 'hoops-dropdown',
  elementClass: dropdown.DropdownMenu,
  react: React,
});

export const HoopsIcon = createComponent({
  tagName: 'hoops-icon',
  elementClass: icons.HoopsIcon,
  react: React,
});

export const HoopsSwitch = createComponent({
  tagName: 'hoops-switch',
  elementClass: hoopsSwitch.HoopsSwitchElement,
  react: React,
  events: {
    onChange: 'change',
  },
});

export const HoopsAccordion = createComponent({
  tagName: 'hoops-accordion',
  elementClass: accordion.HoopsAccordion,
  react: React,
  events: {
    onChange: 'change',
  },
});

export const HoopsCoordinateInput = createComponent({
  tagName: 'hoops-coordinate-input',
  elementClass: common.HoopsCoordinateInputElement,
  react: React,
  events: {
    onHoopsCoordinateChanged: 'hoops-coordinate-changed',
  },
});

export const HoopsColorButton = createComponent({
  tagName: 'hoops-color-button',
  elementClass: common.HoopsColorButtonElement,
  react: React,
  events: {
    onChange: 'change',
  },
});
