import FullscreenPlugin from '@jspsych/plugin-fullscreen';
import htmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import jsPsychSurveyHtmlForm from '@jspsych/plugin-survey-html-form';
import { Marked, Renderer } from '@ts-stack/markdown';
import { DataCollection, JsPsych, initJsPsych } from 'jspsych';

import { ExperimentResult, ResponseElement } from '@/modules/config/AppResults';
import {
  AppSettings,
  OtherElementType,
  QuestionTypes,
} from '@/modules/config/AppSettings';

import '../styles/main.scss';

//= ==========================================================================================
// TYPE DEFINITIONS
//= ==========================================================================================

/**
 * @brief Type definition for jsPsych timeline
 */
export type Timeline = JsPsych['timeline'];

/**
 * @brief Type definition for survey model (currently unused)
 */
export type SurveyModel = unknown;

/**
 * @brief Type definition for individual trial configuration
 */
export type Trial = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: unknown;
} & Record<string, unknown>;

//= ==========================================================================================
// CONFIGURATION
//= ==========================================================================================

/**
 * @brief Configure markdown parser options
 */
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

//= ==========================================================================================
// UTILITY FUNCTIONS
//= ==========================================================================================

/**
 * @brief Retrieves saved response for a specific question
 * @param result Previous experiment results
 * @param name Question identifier
 * @returns The saved answer as string, or empty string if not found
 */
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

/**
 * @brief Sets up event listeners for Likert scale interactions
 * @param container The container element containing Likert scale questions
 */
const setupLikertInteractions = (container: HTMLElement): void => {
  const likertContainers = container.querySelectorAll('.likert-horizontal');

  likertContainers.forEach((likertContainer) => {
    const labels = likertContainer.querySelectorAll('label');

    labels.forEach((label) => {
      label.addEventListener('click', () => {
        // Remove selected class from all labels in this question group
        const allLabels = likertContainer.querySelectorAll('label');
        allLabels.forEach((l) => l.classList.remove('selected'));

        // Add selected class to clicked label
        label.classList.add('selected');

        // Check the radio button
        const radio = label.querySelector(
          'input[type="radio"]',
        ) as HTMLInputElement;
        if (radio) {
          radio.checked = true;
        }
      });
    });
  });
};

/**
 * @brief Initializes already-selected Likert scale options on page load
 * @param container The container element containing Likert scale questions
 */
const initializeLikertSelections = (container: HTMLElement): void => {
  const checkedRadios = container.querySelectorAll(
    '.likert-horizontal input[type="radio"]:checked',
  );
  checkedRadios.forEach((radio) => {
    const label = radio.closest('label');
    if (label) {
      label.classList.add('selected');
    }
  });
};

/**
 * @brief Generates HTML content for different question types
 * @param element Question configuration object
 * @param result Previous experiment results for pre-filling answers
 * @returns HTML string for the question
 */
const buildQuestionHTML = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  element: any,
  result: ExperimentResult | undefined,
): string => {
  switch (element.type) {
    case QuestionTypes.ShortAnswer:
      return `
        <div class="question-block">
          <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
          ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
          <input type="${element.answerType}" ${element.dataValidation?.min ? `min="${element.dataValidation?.min}"` : ''} ${element.dataValidation?.max ? `max="${element.dataValidation?.max}"` : ''} value="${result ? getResult(result, element.name) : ''}" name="${element.name}" ${element.mandatory ? 'required' : ''} />
        </div>`;

    case QuestionTypes.LongAnswer:
      return `
        <div class="question-block">
          <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
          ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
          <textarea name="${element.name}" ${element.mandatory ? 'required' : ''} rows="5" placeholder="Type your response here...">${getResult(result, element.name)}</textarea>
        </div>`;

    case QuestionTypes.MultipleChoice:
      return `
        <div class="question-block">
          <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
          ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
          <div class="question-options">
            ${element.answers
              .map(
                (answer: string) => `
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

    case QuestionTypes.MultiAnswer:
      return `
        <div class="question-block">
          <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
          ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
          <div class="question-options">
            ${element.answers
              .map(
                (answer: string) => `
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

    case QuestionTypes.LikertScale:
      return `
        <div class="question-block">
          <h1 class="question-title">${element.question}${element.mandatory ? '<span class="required-mark">*</span>' : ''}</h1>
          ${element.description ? `<p class="question-description">${element.description}</p>` : ''}
          <div class="question-options likert-horizontal" data-question="${element.name}">
            ${element.scale
              .map(
                (answer: string) => `
                <label>
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

    case OtherElementType.Text:
      return `
        <div class="question-block text-block">
          <h1 class="text-title">${element.title}</h1>
          <div class="text-content">${Marked.parse(element.description)}</div>
        </div>`;

    default:
      console.warn('Unknown question type: ', element);
      return '';
  }
};

//= ==========================================================================================
// TIMELINE BUILDERS
//= ==========================================================================================

/**
 * @brief Creates timeline with each question on a separate page
 * @param jsPsych The jsPsych instance
 * @param settings Application settings
 * @param result Previous experiment results
 * @param onFinish Callback function for experiment completion
 * @returns Timeline array with separate pages for each question
 */
const buildSeparatePagesTimeline = (
  jsPsych: JsPsych,
  settings: AppSettings,
  result: ExperimentResult | undefined,
  onFinish: (data: DataCollection, settings: AppSettings) => void,
): Timeline => {
  const timeline: Timeline = [];
  const totalQuestions = settings.surveySettings.survey.length;

  settings.surveySettings.survey.forEach((element, index) => {
    if (element.type === OtherElementType.Text) {
      // Text elements use keyboard response with spacebar continuation
      timeline.push({
        type: htmlKeyboardResponse,
        stimulus: buildQuestionHTML(element, result),
        choices: [' '],
        prompt:
          '<p style="text-align: center; margin-top: 20px; font-style: italic;">Press the spacebar to continue</p>',
        on_finish(data: ResponseElement) {
          // eslint-disable-next-line no-param-reassign
          data.name = element.name || `text_${index}`;

          if (jsPsych.progressBar) {
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar.progress = (index + 1) / totalQuestions;
          }

          if (index === totalQuestions - 1) {
            onFinish(jsPsych.data.get(), settings);
          }
        },
      });
    } else {
      // Question elements use survey form
      timeline.push({
        type: jsPsychSurveyHtmlForm,
        preamble: '',
        html: buildQuestionHTML(element, result),
        on_load() {
          // Set up Likert interactions after the page loads
          const container = document.getElementById('jspsych-content');
          if (container) {
            setupLikertInteractions(container);
            // Initialize any pre-selected options
            setTimeout(() => initializeLikertSelections(container), 100);
          }
        },
        on_finish(data: ResponseElement) {
          // eslint-disable-next-line no-param-reassign
          data.name = element.name;

          if (jsPsych.progressBar) {
            // eslint-disable-next-line no-param-reassign
            jsPsych.progressBar.progress = (index + 1) / totalQuestions;
          }

          if (index === totalQuestions - 1) {
            onFinish(jsPsych.data.get(), settings);
          }
        },
      });
    }
  });

  return timeline;
};

/**
 * @brief Creates timeline with all questions combined on a single page
 * @param jsPsych The jsPsych instance
 * @param settings Application settings
 * @param result Previous experiment results
 * @param onFinish Callback function for experiment completion
 * @returns Timeline array with all questions on one page
 */
const buildCombinedPageTimeline = (
  jsPsych: JsPsych,
  settings: AppSettings,
  result: ExperimentResult | undefined,
  onFinish: (data: DataCollection, settings: AppSettings) => void,
): Timeline => {
  const timeline: Timeline = [];
  let combinedHTML = '';

  // Combine all questions into a single HTML string
  settings.surveySettings.survey.forEach((element) => {
    combinedHTML += buildQuestionHTML(element, result);
  });

  timeline.push({
    type: jsPsychSurveyHtmlForm,
    preamble: '',
    html: combinedHTML,
    on_load() {
      // Set up Likert interactions after the page loads
      const container = document.getElementById('jspsych-content');
      if (container) {
        setupLikertInteractions(container);
        // Initialize any pre-selected options
        setTimeout(() => initializeLikertSelections(container), 100);
      }
    },
    on_finish(data: ResponseElement) {
      // eslint-disable-next-line no-param-reassign
      data.name = 'combined_survey';
      onFinish(jsPsych.data.get(), settings);

      if (jsPsych.progressBar) {
        // eslint-disable-next-line no-param-reassign
        jsPsych.progressBar.progress = 1;
      }
    },
  });

  return timeline;
};

/**
 * @brief Main timeline builder that delegates to appropriate sub-builder
 * @param jsPsych The jsPsych instance
 * @param settings Application settings
 * @param result Previous experiment results
 * @param onFinish Callback function for experiment completion
 * @param separatePages Whether to use separate pages for each question
 * @returns Complete timeline for the survey
 */
const buildTimelineFromSurvey = (
  jsPsych: JsPsych,
  settings: AppSettings,
  result: ExperimentResult | undefined,
  onFinish: (data: DataCollection, settings: AppSettings) => void,
  separatePages: boolean,
): Timeline => {
  if (separatePages) {
    return buildSeparatePagesTimeline(jsPsych, settings, result, onFinish);
  }
  return buildCombinedPageTimeline(jsPsych, settings, result, onFinish);
};

//= ==========================================================================================
// SPECIAL TRIALS
//= ==========================================================================================

/**
 * @brief Creates fullscreen entry trial
 * @returns Trial configuration for fullscreen activation
 */
const getFullScreenTrial = (): Trial => ({
  type: FullscreenPlugin,
  choices: ['Start'],
  message:
    '<div style="text-align: center; font-size: 24px;">Begin the Experiment</div>',
  fullscreen_mode: true,
  on_finish: () => {
    window.scrollTo(0, 0);
  },
});

/**
 * @brief Creates end page trial with link to next step
 * @param title Page title
 * @param description Page description (supports markdown)
 * @param link URL for next step
 * @param linkText Display text for the link
 * @returns Trial configuration for end page
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

//= ==========================================================================================
// MAIN EXPERIMENT RUNNER
//= ==========================================================================================

/**
 * @brief Main experiment execution function
 * @param input Configuration object containing app settings and optional previous results
 * @param onFinish Callback function executed when experiment completes
 * @returns Promise resolving to jsPsych instance
 *
 * This function initializes and runs a jsPsych experiment based on the provided settings.
 * It supports both single-page and multi-page survey formats, with optional fullscreen
 * mode and end page redirection.
 */
export async function run({
  input,
  onFinish,
}: {
  input: {
    appSettings: AppSettings;
    experimentResult?: ExperimentResult;
  };
  onFinish: (data: DataCollection, settings: AppSettings) => void;
}): Promise<JsPsych> {
  // Determine survey presentation mode from settings
  const useSeparatePages =
    input.appSettings.fullScreenSettings.pagePerQuestion ?? false;

  // Calculate total number of trials for progress tracking
  let totalTrials: number;
  if (useSeparatePages) {
    const surveyQuestions = input.appSettings.surveySettings.survey.length;
    totalTrials =
      (input.appSettings.fullScreenSettings.fullScreen ? 1 : 0) +
      surveyQuestions +
      (input.appSettings.nextStepSettings.linkToNextPage ? 1 : 0);
  } else {
    totalTrials =
      (input.appSettings.fullScreenSettings.fullScreen ? 1 : 0) +
      1 + // Combined survey page
      (input.appSettings.nextStepSettings.linkToNextPage ? 1 : 0);
  }

  // Progress bar is only shown for multi-page surveys
  const shouldShowProgressBar = useSeparatePages && totalTrials > 1;

  // Initialize jsPsych with appropriate configuration
  const jsPsych: JsPsych = initJsPsych({
    show_progress_bar: shouldShowProgressBar,
    auto_update_progress_bar: false,
    display_element: 'jspsych-content',
    on_finish() {
      onFinish(jsPsych.data.get(), input.appSettings);
    },
  });

  // Save data on page unload
  window.addEventListener('beforeunload', () => {
    onFinish(jsPsych.data.get(), input.appSettings);
  });

  // Build experiment timeline
  const jsPsychTimeline: Timeline = [];

  // Add fullscreen trial if enabled
  if (input.appSettings.fullScreenSettings.fullScreen) {
    jsPsychTimeline.push(getFullScreenTrial());
  }

  // Add survey trials
  jsPsychTimeline.push(
    ...buildTimelineFromSurvey(
      jsPsych,
      input.appSettings,
      input.experimentResult,
      onFinish,
      useSeparatePages,
    ),
  );

  // Add end page if enabled
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

  // Execute the experiment
  await jsPsych.run(jsPsychTimeline);

  return jsPsych;
}
