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

// Define the selectLikert function globally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).selectLikert = function selectLikert(
  clickedLabel: HTMLElement,
) {
  // Remove selected class from all labels in this question group
  const container = clickedLabel.closest('.question-options');
  if (container) {
    const allLabels = container.querySelectorAll('label');
    allLabels.forEach((label) => {
      label.classList.remove('selected');
    });
  }

  // Add selected class to clicked label
  clickedLabel.classList.add('selected');

  // Check the radio button
  const radio = clickedLabel.querySelector(
    'input[type="radio"]',
  ) as HTMLInputElement;
  if (radio) {
    radio.checked = true;
  }
};

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

  // Build all questions with their inputs together
  let combinedHTML = '';

  settings.surveySettings.survey.forEach((element) => {
    switch (element.type) {
      case QuestionTypes.ShortAnswer:
        combinedHTML += `
          <div class="question-block">
            <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
            ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
            <input type="${element.answerType}" ${element.dataValidation?.min ? `min="${element.dataValidation?.min}"` : ''} ${element.dataValidation?.max ? `max="${element.dataValidation?.max}"` : ''} value="${result ? getResult(result, element.name) : ''}" name="${element.name}" ${element.mandatory ? 'required' : ''} />
          </div>`;
        break;

      case QuestionTypes.LongAnswer:
        combinedHTML += `
          <div class="question-block">
            <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
            ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
            <textarea name="${element.name}" ${element.mandatory ? 'required' : ''} rows="5" placeholder="Type your response here...">${getResult(result, element.name)}</textarea>
          </div>`;
        break;

      case QuestionTypes.MultipleChoice:
        combinedHTML += `
          <div class="question-block">
            <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
            ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
            <div class="question-options">
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
                  </label>
                `,
                )
                .join('')}
            </div>
          </div>`;
        break;

      case QuestionTypes.MultiAnswer:
        combinedHTML += `
          <div class="question-block">
            <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
            ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
            <div class="question-options">
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
                  </label>
                `,
                )
                .join('')}
            </div>
          </div>`;
        break;

      case QuestionTypes.LikertScale:
        combinedHTML += `
          <div class="question-block">
            <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
            ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
            <div class="question-options likert-horizontal" data-question="${element.name}">
              ${element.scale
                .map(
                  (answer) => `
                  <label onclick="selectLikert(this, '${element.name}')">
                    <input 
                      type="radio" 
                      name="${element.name}" 
                      value="${answer}" 
                      ${getResult(result, element.name) === answer ? 'checked' : ''}
                      ${element.mandatory ? 'required' : ''}
                    >
                    <span>${answer}</span>
                  </label>
                `,
                )
                .join('')}
            </div>
          </div>`;
        break;

      case OtherElementType.Text:
        combinedHTML += `
          <div class="question-block text-block">
            <h1 class="text-title">${element.title}</h1>
            <div class="text-content">${Marked.parse(element.description)}</div>
          </div>`;
        break;

      default:
        console.warn('Unknown question type: ', element);
        break;
    }
  });

  // Initialize any pre-selected values - this will run after the HTML is inserted
  const initializeLikertScript = `
    <script>
      // Initialize any pre-selected values on page load
      setTimeout(function() {
        const checkedRadios = document.querySelectorAll('.likert-horizontal input[type="radio"]:checked');
        checkedRadios.forEach(radio => {
          const label = radio.closest('label');
          if (label) {
            label.classList.add('selected');
          }
        });
      }, 100);
    </script>
`;

  // Add the initialization script to the end of your combinedHTML
  combinedHTML += initializeLikertScript;

  // Create a single timeline item with all questions and their inputs together
  timeline.push({
    type: jsPsychSurveyHtmlForm,
    preamble: '', // No separate preamble needed
    html: combinedHTML,
    on_finish(data: ResponseElement) {
      // eslint-disable-next-line no-param-reassign
      data.name = 'combined_survey';
      onFinish(jsPsych.data.get(), settings);
      // eslint-disable-next-line no-param-reassign
      jsPsych.progressBar!.progress = 1;
    },
  });

  return timeline;
};

/**
 * @returns Returns a simple welcome screen that automatically triggers fullscreen when the start button is pressed
 */
const getFullScreenTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: ['Start'],
  message:
    '<div style="text-align: center; font-size: 24px;">Begin the Experiment</div>',
  fullscreen_mode: true,
  on_finish: () => {
    // Scroll to top when entering fullscreen to ensure content is visible
    window.scrollTo(0, 0);
  },
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
  window.addEventListener('beforeunload', () => {
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
