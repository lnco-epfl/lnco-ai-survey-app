import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import Stack from '@mui/material/Stack';

import { LikertScale } from '@/modules/config/AppSettings';

type LikertScaleSettingsViewProps = {
  questionObject: LikertScale;
  onChange: (question: LikertScale) => void;
};

const LikertScaleSettingsView: FC<LikertScaleSettingsViewProps> = ({
  questionObject,
  onChange,
}) => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS.SECTIONS',
  });
  const { question, scale, description, mandatory } = questionObject;

  const scaleFields = scale.map((scaleOption, index) => (
    <TextField
      key={index}
      value={scaleOption}
      label={`${t('SCALE_OPTION_LABEL')} ${index + 1}`}
      onChange={(e) =>
        onChange({
          ...questionObject,
          scale: questionObject.scale.map((oldOption, i) =>
            i === index ? e.target.value : oldOption,
          ),
        })
      }
    />
  ));

  // Function to handle adding a new scale option
  const handleAddNewScaleOption = (): LikertScale => ({
    ...questionObject,
    scale: [...scale, ''], // Add an empty scale option
  });

  return (
    <Stack spacing={1}>
      <TextField
        value={question}
        label={t('QUESTION_LABEL')}
        onChange={(e) =>
          onChange({ ...questionObject, question: e.target.value })
        }
      />
      <TextField
        value={description}
        label={t('DESCRIPTION_LABEL')}
        onChange={(e) =>
          onChange({ ...questionObject, description: e.target.value })
        }
      />
      <FormControlLabel
        control={<Switch />}
        label={t('MANDATORY_LABEL')}
        onChange={(e, checked) =>
          onChange({ ...questionObject, mandatory: checked })
        }
        checked={mandatory}
      />
      {scaleFields}
      <Box>
        <Button
          variant="outlined"
          onClick={() => onChange(handleAddNewScaleOption())}
        >
          {t('ADD_SCALE_OPTION')}
        </Button>
      </Box>
    </Stack>
  );
};

export default LikertScaleSettingsView;