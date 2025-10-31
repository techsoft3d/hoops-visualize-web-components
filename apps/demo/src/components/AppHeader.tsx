import AppMenu from './AppMenu';

import hwpIcon from '../assets/hoopsvisualize_logo.svg';
import ts3dIcon from '../assets/techsoft3dlogo.svg';
import HoopsVersionDialog from './HoopsVersionDialog';
import DarkThemeToggle from './DarkThemeToggle';

export type AppHeaderProps = {
  sessionName?: string;
  versions: { viewerVersion: string; formatVersion: string };
  infoShown: boolean;
  onInfoToggled?: (open: boolean) => unknown;
  onOpenEmpty?: () => unknown;
  onOpenModel?: (modelName: string) => unknown;
  onImportModel?: (modelName: string) => unknown;
  onImportLocalModel?: (file: File) => unknown;
};

function AppHeader(props: AppHeaderProps) {
  return (
    <header
      data-testid="menu-bar"
      slot="menu-bar"
      style={{
        position: 'relative',
        paddingRight: '0.5rem',
      }}
    >
      <AppMenu
        onOpenEmpty={props.onOpenEmpty}
        onOpenModel={props.onOpenModel}
        onImportModel={props.onImportModel}
        onImportLocalModel={props.onImportLocalModel}
      />
      <a
        href="https://docs.techsoft3d.com/hoops/visualize-web/index.html?redirect=true"
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className="logo" alt="HWP logo" src={hwpIcon} />
      </a>
      <div style={{ width: '100%', display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        <h1>Demo</h1>
        <h2 data-testid="session-name" style={{ fontWeight: 5, opacity: 0.7 }}>
          {props.sessionName ?? 'untitled'}
        </h2>
      </div>
      <a
        href="https://www.techsoft3d.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginTop: '.2rem' }}
      >
        <img className="logo" alt="TS3D logo" src={ts3dIcon} style={{ height: '2rem' }} />
      </a>
      <div style={{ marginRight: '.4rem' }}>
        <DarkThemeToggle />
      </div>
      <HoopsVersionDialog
        viewerVersion={props.versions.viewerVersion}
        formatVersion={props.versions.formatVersion}
      />
    </header>
  );
}

export default AppHeader;
