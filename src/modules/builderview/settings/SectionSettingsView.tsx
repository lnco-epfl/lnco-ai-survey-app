import { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Typography,
} from '@mui/material';
import Stack from '@mui/material/Stack';

import {
  LikertScale,
  LongAnswer,
  MultiAnswer,
  MultipleChoice,
  OtherElementType,
  PageButtonSettings,
  QuestionTypes,
  ShortAnswer,
  SurveyElement,
  SurveyElementType,
  SurveySettings,
  TextElement,
} from '@/modules/config/AppSettings';

import PageButtonSettingsView from './PageButtonSettingsView';
import LikertScaleSettingsView from './questionviews/LickertScaleSettingsView';
import LongAnswerSettingsView from './questionviews/LongAnswerSettingsView';
import MultiAnswerSettingsView from './questionviews/MultiAnswerSettingsView';
import MultipleChoiceSettingsView from './questionviews/MultipleChoiceSettingsView';
import ShortAnswerSettingsView from './questionviews/ShortAnswerSettingsView';
import TextElementSettingsView from './questionviews/TextElementSettingsView';

type SectionSettingsViewProps = {
  surveySettings: SurveySettings;
  onChange: (newSetting: SurveySettings) => void;
};

const createQuestionId = (): string =>
  `id${Math.random().toString(16).slice(2)}`;

const SectionSettingsView: FC<SectionSettingsViewProps> = ({
  surveySettings,
  onChange,
}) => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS.SECTIONS',
  });
  const { survey, pageButtonSettings } = surveySettings;

  // Function to handle adding a new item
  const handleAddNewItem = (type: SurveyElementType): SurveySettings => {
    let newItem: SurveyElement | undefined; // Initialize as undefined
    switch (type) {
      case QuestionTypes.MultipleChoice:
        newItem = {
          type: QuestionTypes.MultipleChoice,
          name: createQuestionId(),
          question: '',
          answers: [''],
          description: '',
          mandatory: false,
        };
        break;
      case QuestionTypes.ShortAnswer:
        newItem = {
          type: QuestionTypes.ShortAnswer,
          name: createQuestionId(),
          question: '',
          mandatory: false,
          description: '',
          answerType: 'text',
        };
        break;

      case QuestionTypes.LongAnswer:
        newItem = {
          type: QuestionTypes.LongAnswer,
          name: createQuestionId(),
          question: '',
          description: '',
          mandatory: false,
        };
        break;
      case QuestionTypes.MultiAnswer:
        newItem = {
          type: QuestionTypes.MultiAnswer,
          name: createQuestionId(),
          question: '',
          mandatory: false,
          description: '',
          answers: [''],
        };
        break;
      case QuestionTypes.LikertScale:
        newItem = {
          type: QuestionTypes.LikertScale,
          name: createQuestionId(),
          question: '',
          mandatory: false,
          description: '',
          scale: [
            'Strongly Disagree',
            'Disagree',
            'Neutral',
            'Agree',
            'Strongly Agree',
          ],
        };
        break;
      case OtherElementType.Text:
        newItem = {
          type: OtherElementType.Text,
          name: createQuestionId(),
          title: '',
          description: '',
        };
        break;
      default:
        break;
    }

    if (newItem) {
      const updatedItems = [...survey, newItem]; // Append the new item
      return {
        pageButtonSettings,
        survey: updatedItems,
      };
    }
    return { pageButtonSettings, survey };
  };

  const onChangeQuestion = (
    index: number,
    newQuestion: SurveyElement,
  ): void => {
    const updatedQuestions = survey.map((question, i) =>
      i === index ? newQuestion : question,
    );
    onChange({ pageButtonSettings, survey: updatedQuestions });
  };

  const onDeleteButtonClick = (index: number): void => {
    const updatedQuestions = survey.filter((question, i) => i !== index);
    onChange({ pageButtonSettings, survey: updatedQuestions });
  };

  const onUpButtonClick = (index: number): void => {
    // Handle the case for moving up within the same section
    const updatedQuestions = [...survey]; // Copy the current section's questions
    const temp = updatedQuestions[index - 1]; // Store the question above the current one
    updatedQuestions[index - 1] = updatedQuestions[index]; // Swap the current question up
    updatedQuestions[index] = temp; // Swap the above question down

    onChange({ pageButtonSettings, survey: updatedQuestions }); // Update the state
  };

  const onDownButtonClick = (index: number): void => {
    // Handle the case for moving up within the same section
    const updatedQuestions = [...survey]; // Copy the current section's questions
    const temp = updatedQuestions[index + 1]; // Store the question above the current one
    updatedQuestions[index + 1] = updatedQuestions[index]; // Swap the current question up
    updatedQuestions[index] = temp; // Swap the above question down

    onChange({ pageButtonSettings, survey: updatedQuestions }); // Update the state
  };

  const elementHeaderArea = (
    index: number,
    type: SurveyElementType,
  ): ReactNode => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Typography variant="h6">{`Element ${index + 1}: ${t(`LABEL_${type}`)}`}</Typography>
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        divider={
          <Divider orientation="vertical" flexItem sx={{ marginY: '8px' }} />
        }
      >
        {index !== 0 && (
          <Button variant="text" onClick={() => onUpButtonClick(index)}>
            Up
          </Button>
        )}
        {index !== survey.length - 1 && (
          <Button variant="text" onClick={() => onDownButtonClick(index)}>
            Down
          </Button>
        )}
        <Button variant="text" onClick={() => onDeleteButtonClick(index)}>
          Delete
        </Button>
      </Stack>
    </Box>
  );

  const getSectionsDisplay = (): ReactNode[] =>
    survey
      ? survey.map((element, index) => {
          const questionHeader = elementHeaderArea(index, element.type); // Get header based on element type

          switch (element.type) {
            case QuestionTypes.ShortAnswer:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <ShortAnswerSettingsView
                      questionObject={element as ShortAnswer}
                      onChange={(newQuestion: ShortAnswer) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            case QuestionTypes.LongAnswer:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <LongAnswerSettingsView
                      questionObject={element as LongAnswer}
                      onChange={(newQuestion: LongAnswer) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            case QuestionTypes.MultipleChoice:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <MultipleChoiceSettingsView
                      questionObject={element as MultipleChoice}
                      onChange={(newQuestion: MultipleChoice) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            case QuestionTypes.MultiAnswer:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <MultiAnswerSettingsView
                      questionObject={element as MultiAnswer}
                      onChange={(newQuestion: MultiAnswer) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            case QuestionTypes.LikertScale:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <LikertScaleSettingsView
                      questionObject={element as LikertScale}
                      onChange={(newQuestion: LikertScale) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            case OtherElementType.Text:
              return (
                <Accordion key={index}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {questionHeader}
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextElementSettingsView
                      textElement={element as TextElement}
                      onChange={(newQuestion: TextElement) =>
                        onChangeQuestion(index, newQuestion)
                      }
                    />
                  </AccordionDetails>
                </Accordion>
              );

            default:
              return null;
          }
        })
      : [];

  const newItemButtonElement = (): JSX.Element => (
    <Box sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(QuestionTypes.MultipleChoice))}
      >
        {t('ADD_MC_QUESTION')}
      </Button>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(QuestionTypes.ShortAnswer))}
      >
        {t('ADD_SA_QUESTION')}
      </Button>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(QuestionTypes.LongAnswer))}
      >
        {t('ADD_LA_QUESTION')}
      </Button>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(QuestionTypes.MultiAnswer))}
      >
        {t('ADD_MA_QUESTION')}
      </Button>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(QuestionTypes.LikertScale))}
      >
        {t('ADD_LS_QUESTION')}
      </Button>
      <Button
        variant="contained"
        onClick={() => onChange(handleAddNewItem(OtherElementType.Text))}
      >
        {t('ADD_TEXT_ELEMENT')}
      </Button>
    </Box>
  );

  return (
    <Stack spacing={2}>
      <PageButtonSettingsView
        onChange={(newPageButtonSettings: PageButtonSettings) =>
          onChange({ survey, pageButtonSettings: newPageButtonSettings })
        }
        pageButtonSettings={pageButtonSettings}
      />
      {getSectionsDisplay()}
      {newItemButtonElement()}
    </Stack>
  );
};

export default SectionSettingsView;
