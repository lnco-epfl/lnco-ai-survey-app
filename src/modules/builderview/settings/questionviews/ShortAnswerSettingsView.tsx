import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';

import {
  AnswerTypeOption,
  ShortAnswer,
  answerTypeOptionsArray,
} from '@/modules/config/AppSettings';

type ShortAnswerSettingsViewProps = {
  questionObject: ShortAnswer;
  onChange: (question: ShortAnswer) => void;
};

const ShortAnswerSettingsView: FC<ShortAnswerSettingsViewProps> = ({
  questionObject,
  onChange,
}) => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS.SECTIONS',
  });
  const { question, description, mandatory, answerType, dataValidation } =
    questionObject;

  let dataValidationElement: ReactNode;
  switch (answerType) {
    case 'number':
      dataValidationElement = (
        <Stack spacing={1}>
          <Typography variant="h6">{t(`DATA_VALIDATION_TITLE`)}</Typography>
          <Typography variant="body1">
            {t(`DATA_VALIDATION_DESCRIPTION_NUMBER`)}
          </Typography>
          <TextField
            label={t('DATA_VALIDATION_MIN_LABEL_NUMBER')}
            type="number"
            value={dataValidation?.min ? dataValidation.min : ''}
            onChange={(e) =>
              onChange({
                ...questionObject,
                dataValidation: {
                  ...dataValidation,
                  min: Number(e.target.value),
                },
              })
            }
          />
          <TextField
            label={t('DATA_VALIDATION_MAX_LABEL_NUMBER')}
            type="number"
            value={dataValidation?.max ? dataValidation.max : ''}
            onChange={(e) =>
              onChange({
                ...questionObject,
                dataValidation: {
                  ...dataValidation,
                  max: Number(e.target.value),
                },
              })
            }
          />
        </Stack>
      );
      break;
    case 'date':
    case 'month':
      dataValidationElement = (
        <Stack>
          <Typography variant="h6">{t(`DATA_VALIDATION_TITLE`)}</Typography>
          <Typography variant="body1">
            {t(`DATA_VALIDATION_DESCRIPTION_NUMBER`)}
          </Typography>
          <TextField
            label={t('DATA_VALIDATION_MIN_LABEL_NUMBER')}
            type={answerType}
            value={dataValidation?.min ? dataValidation.min : ''}
            onChange={(e) =>
              onChange({
                ...questionObject,
                dataValidation: {
                  ...dataValidation,
                  min: e.target.value,
                },
              })
            }
          />
          <TextField
            label={t('DATA_VALIDATION_MAX_LABEL_NUMBER')}
            type={answerType}
            value={dataValidation?.max ? dataValidation.max : ''}
            onChange={(e) =>
              onChange({
                ...questionObject,
                dataValidation: {
                  ...dataValidation,
                  max: e.target.value,
                },
              })
            }
          />
        </Stack>
      );
      break;
    default:
      break;
  }

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
      <TextField
        select
        label={t('ANSWER_TYPE_LABEL')}
        value={answerType}
        onChange={(e) =>
          onChange({
            ...questionObject,
            answerType: e.target.value as AnswerTypeOption,
          })
        }
      >
        {answerTypeOptionsArray.map((answerTypeOption, index) => (
          <MenuItem key={index} value={answerTypeOption}>
            {
              // @ts-ignore
              t(`TYPE_LABEL_${answerTypeOption}`)
            }
          </MenuItem>
        ))}
      </TextField>
      {dataValidationElement}
    </Stack>
  );
};

export default ShortAnswerSettingsView;
