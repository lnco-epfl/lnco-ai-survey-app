import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Button, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

// eslint-disable-next-line import/no-extraneous-dependencies
import { isEqual } from 'lodash';

import {
  FullScreenSettings,
  NextStepSettings,
  SurveySettings,
} from '@/modules/config/AppSettings';
import { useSettings } from '@/modules/context/SettingsContext';

import FullScreenSettingsView from './FullScreenSettingsView';
import NextStepSettingsView from './NextStepSettingsView';
import SectionSettingsView from './SectionSettingsView';

const SettingsView: FC = () => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS',
  });
  const {
    surveySettings: surveySettingsSavedState,
    fullScreenSettings: fullScreenSavedState,
    nextStepSettings: nextStepSettingsSavedState,
    saveSettings,
  } = useSettings();

  const [surveySettings, setSurveySettings] = useState<SurveySettings>(
    surveySettingsSavedState,
  );
  const [fullScreenSettings, setFullScreenSettings] =
    useState<FullScreenSettings>(fullScreenSavedState);
  const [nextStepSettings, setNextStepSettings] = useState<NextStepSettings>(
    nextStepSettingsSavedState,
  );

  const saveAllSettings = (): void => {
    saveSettings('surveySettings', surveySettings);
    saveSettings('nextStepSettings', nextStepSettings);
    saveSettings('fullScreenSettings', fullScreenSettings);
  };

  const disableSave = useMemo(() => {
    if (
      isEqual(surveySettingsSavedState, surveySettings) &&
      isEqual(fullScreenSavedState, fullScreenSettings) &&
      isEqual(nextStepSettingsSavedState, nextStepSettings)
    ) {
      return true;
    }
    return false;
  }, [
    surveySettings,
    surveySettingsSavedState,
    fullScreenSavedState,
    fullScreenSettings,
    nextStepSettingsSavedState,
    nextStepSettings,
  ]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4">{t('TITLE')}</Typography>
      <FullScreenSettingsView
        fullScreenSettings={fullScreenSettings}
        onChange={(newSetting: FullScreenSettings) => {
          setFullScreenSettings(newSetting);
        }}
      />
      <SectionSettingsView
        surveySettings={surveySettings}
        onChange={(newSetting: SurveySettings) => {
          setSurveySettings(newSetting);
        }}
      />
      <NextStepSettingsView
        nextStepSettings={nextStepSettings}
        onChange={(newSetting: NextStepSettings) => {
          setNextStepSettings(newSetting);
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
