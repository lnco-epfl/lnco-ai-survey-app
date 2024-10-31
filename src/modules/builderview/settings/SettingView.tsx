import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

// eslint-disable-next-line import/no-extraneous-dependencies
import { isEqual } from 'lodash';

import {
  FullScreenSetting,
  SectionSettings,
} from '@/modules/config/AppSettings';
import { useSettings } from '@/modules/context/SettingsContext';

import FullScreenSettingsView from './FullScreenSettingsView';
import SectionSettingsView from './SectionSettingsView';

const SettingsView: FC = () => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS',
  });
  const {
    sectionSettings: sectionSavedState,
    fullScreenSettings: fullScreenSavedState,
    saveSettings,
  } = useSettings();

  const [sections, setSections] = useState<SectionSettings>(sectionSavedState);
  const [fullScreenSettings, setFullScreenSettings] =
    useState<FullScreenSetting>(fullScreenSavedState);

  const saveAllSettings = (): void => {
    saveSettings('sectionSettings', sections);
    saveSettings('fullScreenSettings', fullScreenSettings);
  };

  const disableSave = useMemo(() => {
    if (
      isEqual(sectionSavedState, sections) &&
      isEqual(fullScreenSavedState, fullScreenSettings)
    ) {
      return true;
    }
    return false;
  }, [sectionSavedState, sections, fullScreenSavedState, fullScreenSettings]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{t('TITLE')}</Typography>
      <FullScreenSettingsView
        fullScreenSettings={fullScreenSettings}
        onChange={(newSetting: FullScreenSetting) => {
          setFullScreenSettings(newSetting);
        }}
      />
      <SectionSettingsView
        sectionSettings={sections}
        onChange={(newSetting: SectionSettings) => {
          setSections(newSetting);
        }}
      />
      <Box>
        <Button
          variant="contained"
          onClick={saveAllSettings}
          disabled={disableSave}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
};

export default SettingsView;
