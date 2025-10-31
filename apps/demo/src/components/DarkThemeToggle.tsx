import { useEffect, useState } from 'react';
import { HoopsIcon, HoopsIconButton } from '@ts3d-hoops/ui-kit-react';

export function DarkThemeToggle() {
  const [darkThemeEnabled, setDarkThemeEnabled] = useState<boolean>(
    () => localStorage.getItem('darkThemeEnabled') === 'true',
  );
  useEffect(() => {
    localStorage.setItem('darkThemeEnabled', darkThemeEnabled.toString());
    document.body.classList.toggle('dark', darkThemeEnabled);
  }, [darkThemeEnabled]);

  const button = darkThemeEnabled ? (
    <HoopsIcon icon="moon" title="Switch to light theme" />
  ) : (
    <HoopsIcon icon="light" title="Switch to dark theme" />
  );

  return (
    <HoopsIconButton onClick={() => setDarkThemeEnabled(!darkThemeEnabled)}>
      {button}
    </HoopsIconButton>
  );
}

export default DarkThemeToggle;
