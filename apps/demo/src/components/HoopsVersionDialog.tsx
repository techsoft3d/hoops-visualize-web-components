import { HoopsDropdown } from '@ts3d-hoops/ui-kit-react';
import { HoopsInfoButton } from '@ts3d-hoops/web-viewer-components-react';

interface HoopsVersionDialogProps {
  viewerVersion: string;
  formatVersion: string;
}

export function HoopsVersionDialog(props: HoopsVersionDialogProps) {
  return (
    <HoopsDropdown
      anchor="right"
      preventCloseOnClickInside
      style={{ '--hoops-dropdown-gap': '1.2rem' } as any}
    >
      <HoopsInfoButton title={'Toggle info dialog'} />
      <div
        className="dropdown-content"
        slot="dropdown-popup"
        data-testid="version-dialog"
        tabIndex={-1}
        style={{
          backgroundColor: '--hoops-dropdown-background-color',
          borderRadius: '0.25rem',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexFlow: 'column nowrap',
          padding: '0.75rem',
          minWidth: '12rem',
          color: '--hoops-neutral-foreground',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '0.75rem' }}>
          Viewer Version:
          <br />
          <span data-testid="viewer-version">{props.viewerVersion}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          Format Version:
          <br />
          <span data-testid="format-version">{props.formatVersion}</span>
        </div>
      </div>
    </HoopsDropdown>
  );
}

export default HoopsVersionDialog;
