import { AppSettings } from './AppSettings';

export type ExperimentResult = {
  settings?: AppSettings;
  rawData?: { trials: ResponseElement[] };
};

export type ResponseElement = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type?: unknown;
  name?: string;
  response?: Record<string, unknown>;
} & Record<string, unknown>;
