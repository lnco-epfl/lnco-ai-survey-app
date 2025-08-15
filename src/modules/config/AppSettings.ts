export type AppSettings = {
  surveySettings: SurveySettings;
  fullScreenSettings: FullScreenSettings;
  nextStepSettings: NextStepSettings;
};

export type SurveySettings = {
  survey: SurveyElement[];
  pageButtonSettings: PageButtonSettings;
};

export enum QuestionTypes {
  ShortAnswer = 'shortAnswer',
  LongAnswer = 'longAnswer',
  MultipleChoice = 'multipleChoice',
  MultiAnswer = 'multiAnswer',
  LikertScale = 'likertScale',
}

export enum OtherElementType {
  Text = 'text',
}

export type SurveyElementType = QuestionTypes | OtherElementType;

export type ShortAnswer = {
  type: QuestionTypes.ShortAnswer;
  question: string;
  name: string;
  description: string;
  mandatory: boolean;
  answerType: AnswerTypeOption;
  dataValidation?: {
    min?: number | string;
    max?: number | string;
  };
};

export type AnswerTypeOptions = typeof answerTypeOptionsArray;
export type AnswerTypeOption = AnswerTypeOptions[number];

export type LongAnswer = {
  type: QuestionTypes.LongAnswer;
  question: string;
  name: string;
  description: string;
  mandatory: boolean;
};

export type MultipleChoice = {
  type: QuestionTypes.MultipleChoice;
  question: string;
  name: string;
  description: string;
  mandatory: boolean;
  answers: string[];
};

export type MultiAnswer = {
  type: QuestionTypes.MultiAnswer;
  question: string;
  name: string;
  description: string;
  mandatory: boolean;
  answers: string[];
};

export type LikertScale = {
  type: QuestionTypes.LikertScale;
  question: string;
  name: string;
  description: string;
  mandatory: boolean;
  scale: string[];
};

export type Question =
  | ShortAnswer
  | LongAnswer
  | MultipleChoice
  | MultiAnswer
  | LikertScale;

export type TextElement = {
  type: OtherElementType.Text;
  name: string;
  title: string;
  description: string;
};

export type SurveyElement = Question | TextElement;

export type PageButtonSettings = {
  nextPageText: string;
  previousPageText: string;
  finishSurveyText: string;
  continueButtonDelay: number;
};

export type FullScreenSettings = {
  fullScreen: boolean;
  pagePerQuestion: boolean;
};

export type NextStepSettings = {
  linkToNextPage: boolean;
  title: string;
  description: string;
  link: string;
  linkText: string;
};

export const answerTypeOptionsArray = ['number', 'text', 'date', 'month'];
