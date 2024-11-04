import { FC, useCallback, useEffect, useRef } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { DataCollection, JsPsych } from 'jspsych';

import { mutations } from '@/config/queryClient';

import { AppSettings } from '../config/AppSettings';
import { useSettings } from '../context/SettingsContext';
import { run } from './jspsych/experiment';

const SurveyLoader: FC = () => {
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);
  const { fullScreenSettings, nextStepSettings, sectionSettings } =
    useSettings();
  const { mutate: postAppData } = mutations.usePostAppData();

  const onFinish = useCallback(
    (rawData: DataCollection, settings: AppSettings): void => {
      postAppData({
        data: { settings, rawData },
        type: 'surveyResults',
      });
    },
    [postAppData],
  );

  useEffect(() => {
    if (!jsPsychRef.current) {
      jsPsychRef.current = run({
        input: { fullScreenSettings, nextStepSettings, sectionSettings },
        onFinish,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="jspsych-content-outer-wrapper">
      <div id="jspsych-content" className="jspsych-content-outer" />
    </div>
  );
};

export default SurveyLoader;
