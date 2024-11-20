import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
// eslint-disable-next-line import/no-extraneous-dependencies
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Marked, Renderer } from '@ts-stack/markdown';
import { DataCollection, JsPsych, initJsPsych } from 'jspsych';

import { ExperimentResult, ResponseElement } from '@/modules/config/AppResults';
import {
  AppSettings,
  OtherElementType,
  QuestionTypes,
} from '@/modules/config/AppSettings';

import '../styles/main.scss';

export type Timeline = JsPsych['timeline'];

export type SurveyModel = unknown;

export type Trial = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: unknown;
} & Record<string, unknown>;

Marked.setOptions({
  renderer: new Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
});

const getResult = (
  result: ExperimentResult | undefined,
  name: string,
): string => {
  let answer = '';
  if (result) {
    result.rawData?.trials.forEach((answerElement) => {
      if (answerElement.name === name && answerElement.response) {
        answer = answerElement.response[name] as string;
      }
    });
  }
  return answer;
};

const buildTimelineFromSurvey = (
  jsPsych: JsPsych,
  settings: AppSettings,
  result: ExperimentResult | undefined,
  onFinish: (data: DataCollection, settings: AppSettings) => void,
): Timeline => {
  const timeline: Timeline = [];
  settings.surveySettings.survey.forEach((element, index) => {
    // Initialize an array to hold all questions for this page
    switch (element.type) {
      case QuestionTypes.ShortAnswer:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          preamble: `
          <div>
            <h6>${element.question}${element.mandatory ? '*' : ''}</h6>
            ${element.description ? `<p><i>${element.description}</i></p>` : ''}
          </div>`,
          html: `<input type="${element.answerType}" ${element.dataValidation?.min ? `min="${element.dataValidation?.min}"` : ''} ${element.dataValidation?.max ? `max="${element.dataValidation?.max}"` : ''} value="${result ? getResult(result, element.name) : ''}" name="${element.name}" id="task-input" ${element.mandatory ? 'required' : ''} /><br>`,
          on_finish(data: ResponseElement) {
            // eslint-disable-next-line no-param-reassign
            data.name = element.name;
            onFinish(jsPsych.data.get(), settings);
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      case QuestionTypes.LongAnswer:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          preamble: `
          <div>
            <h6>${element.question}${element.mandatory ? '*' : ''}</h6>
            ${element.description ? `<p><i>${element.description}</i></p>` : ''}
          </div>`,
          html: `<input value="${getResult(result, element.name)}" name="${element.name}" id="task-input" ${element.mandatory ? 'required' : ''} rows="5"><br>`,
          on_finish(data: ResponseElement) {
            // eslint-disable-next-line no-param-reassign
            data.name = element.name;
            onFinish(jsPsych.data.get(), settings);
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      case QuestionTypes.MultipleChoice:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          preamble: `
          <div>
            <h6>${element.question}${element.mandatory ? '*' : ''}</h6>
            ${element.description ? `<p><i>${element.description}</i></p>` : ''}
          </div>`,
          html: `
          <div>
            ${element.answers
              .map(
                (answer) => `
                <label>
                  <input 
                    type="radio" 
                    name="${element.name}" 
                    value="${answer}" 
                    ${getResult(result, element.name) === answer ? 'checked' : ''}
                    ${element.mandatory ? 'required' : ''}
                  >
                  ${answer}
                </label><br>
              `,
              )
              .join('')}
          </div>`,
          on_finish(data: ResponseElement) {
            // eslint-disable-next-line no-param-reassign
            data.name = element.name;
            onFinish(jsPsych.data.get(), settings);
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      case QuestionTypes.MultiAnswer:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          preamble: `
          <div>
            <h6>${element.question}${element.mandatory ? '*' : ''}</h6>
            ${element.description ? `<p><i>${element.description}</i></p>` : ''}
          </div>`,
          html: `
            <div>
              ${element.answers
                .map(
                  (answer) => `
                  <label>
                    <input 
                      type="checkbox" 
                      name="${element.name}" 
                      value="${answer}" 
                      ${Array.isArray(getResult(result, element.name)) && getResult(result, element.name).includes(answer) ? 'checked' : ''}
                      ${element.mandatory ? 'required' : ''}
                    >
                    ${answer}
                  </label><br>
                `,
                )
                .join('')}
            </div>`,
          on_finish(data: ResponseElement) {
            // eslint-disable-next-line no-param-reassign
            data.name = element.name;
            onFinish(jsPsych.data.get(), settings);
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      case QuestionTypes.LikertScale:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          preamble: `
          <div>
            <h6>${element.question}${element.mandatory ? '*' : ''}</h6>            
            ${element.description ? `<p><i>${element.description}</i></p>` : ''}
          </div>`,
          html: `
          <div>
            ${element.scale
              .map(
                (answer) => `
                <label>
                  <input 
                    type="radio" 
                    name="${element.name}" 
                    value="${answer}" 
                    ${getResult(result, element.name) === answer ? 'checked' : ''}
                    ${element.mandatory ? 'required' : ''}
                  >
                  ${answer}
                </label><br>
              `,
              )
              .join('')}
          </div>`,
          on_finish(data: ResponseElement) {
            // eslint-disable-next-line no-param-reassign
            data.name = element.name;
            onFinish(jsPsych.data.get(), settings);
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      case OtherElementType.Text:
        timeline.push({
          type: jsPsychSurveyHtmlForm,
          html: `<div><h2>${element.title}</h2><p>${Marked.parse(element.description)}</p></div>`,
          on_load() {
            const button = document.getElementById(
              'jspsych-survey-html-form-next',
            ) as HTMLButtonElement;
            if (
              settings.surveySettings.pageButtonSettings.continueButtonDelay >
                0 &&
              button
            ) {
              button.disabled = true;
              setTimeout(() => {
                button.disabled = false;
              }, settings.surveySettings.pageButtonSettings.continueButtonDelay * 1000);
            }
          },
          on_finish() {
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar!.progress =
              (index + 1) / settings.surveySettings.survey.length;
          },
        });
        break;

      default:
        console.warn('Unknown question type: ', element);
        break;
    }
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
  title: string,
  description: string,
  link: string,
  linkText: string,
): Trial => ({
  type: htmlKeyboardResponse,
  choices: 'NO_KEYS',
  stimulus: `<div class='sd-html'><h5>${title}</h5><p>${Marked.parse(description)}</p><a class='link-to-experiment' target="_parent" href=${link}>${linkText}</a></div>`,
});

export async function run({
  input,
  onFinish,
}: {
  input: { appSettings: AppSettings; experimentResult?: ExperimentResult };
  onFinish: (data: DataCollection, settings: AppSettings) => void;
}): Promise<JsPsych> {
  // Initialize jspsych
  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    display_element: 'jspsych-content',
    on_finish() {
      onFinish(jsPsych.data.get(), input.appSettings);
    },
  });

  // Add an event listener for the `beforeunload` event
  window.addEventListener('beforeunload', (event) => {
    // Call the save data function
    onFinish(jsPsych.data.get(), input.appSettings);
  });

  const jsPsychTimeline: Timeline = [];

  if (input.appSettings.fullScreenSettings.fullScreen) {
    jsPsychTimeline.push(getFullScreenTrial());
  }

  jsPsychTimeline.push(
    ...buildTimelineFromSurvey(
      jsPsych,
      input.appSettings,
      input.experimentResult,
      onFinish,
    ),
  );

  if (input.appSettings.nextStepSettings.linkToNextPage) {
    jsPsychTimeline.push(
      getEndPage(
        input.appSettings.nextStepSettings.title,
        input.appSettings.nextStepSettings.description,
        input.appSettings.nextStepSettings.link,
        input.appSettings.nextStepSettings.linkText,
      ),
    );
  }

  await jsPsych.run(jsPsychTimeline);

  return jsPsych;
}
