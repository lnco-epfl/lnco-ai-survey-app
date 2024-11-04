import { Input } from '@mui/material';

import FullscreenPlugin from '@jspsych/plugin-fullscreen';
// eslint-disable-next-line import/no-extraneous-dependencies
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
// eslint-disable-next-line import/no-extraneous-dependencies
import jsPsychSurvey from '@jspsych/plugin-survey';
// eslint-disable-next-line import/no-extraneous-dependencies
// import '@jspsych/plugin-survey/css/survey.css';
import { DataCollection, JsPsych, initJsPsych } from 'jspsych';

import {
  AppSettings,
  OtherElementType,
  QuestionTypes,
  Section,
} from '@/modules/config/AppSettings';

import '../styles/main.scss';

export type Timeline = JsPsych['timeline'];

export type Trial = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: unknown;
} & Record<string, unknown>;

export type Pages = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: string;
} & Record<string, unknown>;

const buildTimelineFromSurvey = (
  sections: Section[],
  input: AppSettings,
): Timeline => {
  const timeline: Timeline = [];
  const pages: Pages[] = [];
  sections.forEach((section) => {
    // Initialize an array to hold all questions for this page
    const pageQuestions: Timeline = [];

    section.forEach((element) => {
      switch (element.type) {
        case QuestionTypes.ShortAnswer:
          pageQuestions.push({
            type: 'text',
            title: element.question,
            rows: 1,
            isRequired: element.mandatory,
            inputType: element.answerType,
            placeholder: 'Your Answer',
          });
          break;

        case QuestionTypes.LongAnswer:
          pageQuestions.push({
            type: 'text',
            title: element.question,
            rows: 5,
            isRequired: element.mandatory,
          });
          break;

        case QuestionTypes.MultipleChoice:
          pageQuestions.push({
            type: 'radiogroup',
            title: element.question,
            choices: element.answers,
            showClearButton: false,
            separateSpecialChoices: false,
          });
          break;

        case QuestionTypes.MultiAnswer:
          pageQuestions.push({
            type: 'checkbox',
            title: element.question,
            choices: element.answers,
            randomize_question_order: true,
            allow_multiple: true,
          });
          break;

        case QuestionTypes.LikertScale:
          pageQuestions.push({
            type: 'radiogroup',
            title: element.question,
            choices: element.scale,
            showClearButton: false,
            separateSpecialChoices: false,
          });
          break;

        case OtherElementType.Text:
          pageQuestions.push({
            type: 'html',
            html: `<div><h2>${element.title}</h2><p>${element.description}</p></div>`,
          });
          break;

        default:
          console.warn('Unknown question type: ', element);
          break;
      }
    });
    pages.push(pageQuestions);
  });
  const pageJson = pages.map((questions, index) => ({
    name: `page${index + 1}`,
    elements: questions,
  }));

  timeline.push({
    type: jsPsychSurvey,
    survey_json: {
      pages: pageJson,
      showQuestionNumbers: false,
      completeText: input.sectionSettings.pageButtonSettings.finishSurveyText,
      pageNextText: input.sectionSettings.pageButtonSettings.nextPageText,
      pagePrevText: input.sectionSettings.pageButtonSettings.previousPageText,
      css: {
        isPanelless: true,
      },
    },
  });
  return timeline;
};

/**
 *
 * @returns Returns a simple welcome screen that automatically triggers fullscreen when the start button is pressed
 */
const getFullScreenTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: ['Start'],
  message:
    '<div style="text-align: center; font-size: 24px;">Begin the Experiment</div>',
  fullscreen_mode: true,
});

/**
 *
 * @returns Returns a simple welcome screen that automatically triggers fullscreen when the start button is pressed
 */
const getEndPage = (
  jspsych: JsPsych,
  title: string,
  description: string,
  link: string,
  onFinish: (data: DataCollection, settings: AppSettings) => void,
  input: AppSettings,
): Trial => ({
  type: htmlKeyboardResponse,
  choices: 'NO_KEYS',
  stimulus: `<div class='sd-html'><h5>${title}</h5><p>${description}</p><a class='link-to-experiment' target="_parent" href=${link}>Click here to go to the experiment</a></div>`,
  on_start: (): void => {
    onFinish(jspsych.data.get(), input);
  },
});

export async function run({
  input,
  onFinish,
}: {
  input: AppSettings;
  onFinish: (data: DataCollection, settings: AppSettings) => void;
}): Promise<JsPsych> {
  const jsPsychTimeline: Timeline = [];

  if (input.fullScreenSettings.fullScreen) {
    jsPsychTimeline.push(getFullScreenTrial());
  }

  jsPsychTimeline.push(
    ...buildTimelineFromSurvey(input.sectionSettings.sections, input),
  );

  // Initialize jspsych
  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    display_element: 'jspsych-content',
    on_finish: (): void => {
      onFinish(jsPsych.data.get(), input);
    },
  });

  if (input.nextStepSettings.linkToNextPage) {
    jsPsychTimeline.push(
      getEndPage(
        jsPsych,
        input.nextStepSettings.title,
        input.nextStepSettings.description,
        input.nextStepSettings.link,
        onFinish,
        input,
      ),
    );
  }

  await jsPsych.run(jsPsychTimeline);

  return jsPsych;
}
