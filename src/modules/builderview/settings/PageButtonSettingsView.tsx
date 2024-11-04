import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TextField } from '@mui/material';
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
  const { finishSurveyText, nextPageText, previousPageText } =
    pageButtonSettings;

  return (
    <Stack spacing={1}>
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
    </Stack>
  );
};

export default PageButtonSettingsView;
