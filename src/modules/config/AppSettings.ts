export type AppSettings = {
  sectionSettings: SectionSettings;
  fullScreenSettings: FullScreenSetting;
};

export type SectionSettings = {
  sections: Section[];
};

export type Section = SurveyElement[];

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
  description: string;
  mandatory: boolean;
  answerType: 'number' | 'text' | 'date';
};

export type LongAnswer = {
  type: QuestionTypes.LongAnswer;
  question: string;
  description: string;
  mandatory: boolean;
};

export type MultipleChoice = {
  type: QuestionTypes.MultipleChoice;
  question: string;
  description: string;
  mandatory: boolean;
  answers: string[];
};

export type MultiAnswer = {
  type: QuestionTypes.MultiAnswer;
  question: string;
  description: string;
  mandatory: boolean;
  answers: string[];
};

export type LikertScale = {
  type: QuestionTypes.LikertScale;
  question: string;
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
  title: string;
  description: string;
  continueButtonText: string;
};

export type SurveyElement = Question | TextElement;

export type FullScreenSetting = {
  fullScreen: boolean;
  pagePerQuestion: boolean;
};
