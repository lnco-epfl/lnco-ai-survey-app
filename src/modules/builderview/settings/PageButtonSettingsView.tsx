import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TextField, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

import { PageButtonSettings } from '@/modules/config/AppSettings';

type PageButtonSettingsViewProps = {
  pageButtonSettings: PageButtonSettings;
  onChange: (newPageButtonSettings: PageButtonSettings) => void;
};

const PageButtonSettingsView: FC<PageButtonSettingsViewProps> = ({
  pageButtonSettings,
  onChange,
}) => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS.SECTIONS',
  });
  const {
    finishSurveyText,
    nextPageText,
    previousPageText,
    continueButtonDelay,
  } = pageButtonSettings || {
    finishSurveyText: '',
    nextPageText: '',
    previousPageText: '',
    continueButtonDelay: 0,
  };

  return (
    <Stack spacing={1}>
      <Typography variant="h6">{t('PAGE_BUTTON_SETTINGS_HEADER')}</Typography>
      <TextField
        value={nextPageText}
        label={t('NEXT_PAGE_LABEL')}
        onChange={(e) =>
          onChange({ ...pageButtonSettings, nextPageText: e.target.value })
        }
      />
      <TextField
        value={previousPageText}
        label={t('PREVIOUS_PAGE_LABEL')}
        onChange={(e) =>
          onChange({ ...pageButtonSettings, previousPageText: e.target.value })
        }
      />
      <TextField
        value={finishSurveyText}
        label={t('FINISH_SURVEY_LABEL')}
        onChange={(e) =>
          onChange({ ...pageButtonSettings, finishSurveyText: e.target.value })
        }
      />
      <Stack spacing={1}>
        <Typography variant="body1">
          {t('CONTINUE_BUTTON_DELAY_DESCRIPTION')}
        </Typography>
        <TextField
          value={continueButtonDelay}
          label={t('CONTINUE_BUTTON_DELAY_LABEL')}
          type="number"
          onChange={(e) =>
            onChange({
              ...pageButtonSettings,
              continueButtonDelay: Number(e.target.value),
            })
          }
        />
      </Stack>
    </Stack>
  );
};

export default PageButtonSettingsView;
