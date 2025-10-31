import { HoopsButton, HoopsIcon } from '@ts3d-hoops/ui-kit-react';
import React from 'react';

type CuttingPlaneButtonProps = {
  title: string;
  onClick: () => unknown;
  disabled?: boolean;
  icon: string;
  children: React.ReactNode;
};

export default function CuttingPlaneButton({
  title,
  onClick,
  disabled,
  icon,
  children,
}: CuttingPlaneButtonProps) {
  return (
    <HoopsButton title={title} onClick={onClick} disabled={disabled}>
      <span slot="icon" style={{ marginRight: '0.5rem' }}>
        <HoopsIcon icon={icon} style={{ width: '100%' }}></HoopsIcon>
      </span>
      {children}
    </HoopsButton>
  );
}
