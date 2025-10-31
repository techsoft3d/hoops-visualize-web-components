import { HoopsButton, HoopsDropdown, HoopsIcon, HoopsIconButton } from '@ts3d-hoops/ui-kit-react';
import { useState } from 'react';
import ModelCatalog from './ModelCatalog';

type AppMenuProps = {
  onOpenEmpty?: () => unknown;
  onOpenModel?: (modelName: string) => unknown;
  onImportModel?: (modelName: string) => unknown;
  onImportLocalModel?: (file: File) => unknown;
};

export function AppMenu(props: AppMenuProps) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [importDialog, setImportDialog] = useState<boolean>(false);

  return (
    <>
      <HoopsDropdown style={{ marginRight: '1rem' }}>
        <HoopsIconButton>
          <HoopsIcon icon="appMenuIcon" />
        </HoopsIconButton>
        <div slot="dropdown-popup" data-testid="app-menu-dropdown" style={{ width: 'max-content' }}>
          <HoopsButton
            onClick={() => {
              if (props.onOpenEmpty) {
                props.onOpenEmpty();
              }
            }}
          >
            <span slot="icon">
              <HoopsIcon icon="newFileIcon" />
            </span>
            Open Empty Viewer
          </HoopsButton>
          <HoopsButton
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            <span slot="icon">
              <HoopsIcon icon="folderIcon" />
            </span>
            Open Model
          </HoopsButton>
          <HoopsButton
            onClick={() => {
              setImportDialog(true);
            }}
          >
            <span slot="icon">
              <HoopsIcon icon="importIcon" />
            </span>
            Import Model
          </HoopsButton>
          <label htmlFor="import-local-model">
            <HoopsButton>
              <span slot="icon">
                <HoopsIcon icon="importIcon" />
              </span>
              Import Local Model
              <input
                type="file"
                accept=".scs"
                name="import-local-model"
                id="import-local-model"
                hidden={true}
                onChange={async (event) => {
                  const elm = event.target as HTMLInputElement;
                  const files = elm.files;
                  if (!files?.length) {
                    return;
                  }

                  const file = files[0];
                  if (props.onImportLocalModel) {
                    props.onImportLocalModel(file);
                  }
                }}
              />
            </HoopsButton>
          </label>
        </div>
      </HoopsDropdown>
      <dialog
        data-testid="open-model-catalog-dialog"
        open={openDialog}
        onBlur={() => setOpenDialog(false)}
        style={{
          width: '80vw',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 1000,
          position: 'absolute',
          top: 'calc(100% + 1rem)',
          backgroundColor: 'var(--hoops-dropdown-background-color)',
        }}
      >
        <ModelCatalog
          onModelSelected={(modelName) => {
            if (props.onOpenModel) {
              props.onOpenModel(modelName);
            }
            setOpenDialog(false);
          }}
        />
        <button style={{ marginTop: '2rem' }} onClick={() => setOpenDialog(false)}>
          close
        </button>
      </dialog>
      <dialog
        data-testid="import-model-catalog-dialog"
        open={importDialog}
        onBlur={() => setImportDialog(false)}
        style={{
          width: '80vw',
          maxHeight: '80vh',
          overflow: 'auto',
          zIndex: 1000,
          position: 'absolute',
          top: 'calc(100% + 1rem)',
          backgroundColor: 'var(--hoops-dropdown-background-color)',
        }}
      >
        <ModelCatalog
          onModelSelected={(modelName) => {
            if (props.onImportModel) {
              props.onImportModel(modelName);
            }
            setImportDialog(false);
          }}
        />
        <button style={{ marginTop: '2rem' }} onClick={() => setImportDialog(false)}>
          close
        </button>
      </dialog>
    </>
  );
}

export default AppMenu;
