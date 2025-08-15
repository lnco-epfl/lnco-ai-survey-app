import { FC, useEffect, useRef } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import { DataCollection, JsPsych } from 'jspsych';

import { ResponseElement } from '../config/AppResults';
import { AppSettings } from '../config/AppSettings';
import { useSettings } from '../context/SettingsContext';
import useSurveyResults from '../context/SurveyContext';
import { run } from './jspsych/experiment';

const SurveyLoader: FC = () => {
  const jsPsychRef = useRef<null | Promise<JsPsych>>(null);
  const { fullScreenSettings, nextStepSettings, surveySettings } =
    useSettings();

  const {
    status,
    surveyResultsAppData,
    setExperimentResult: setSurveyResult,
  } = useSurveyResults();

  const onFinish = (rawData: DataCollection, settings: AppSettings): void => {
    let responseArray = [];
    if (surveyResultsAppData && surveyResultsAppData.rawData?.trials) {
      if (surveyResultsAppData.rawData.trials.length <= rawData.count()) {
        responseArray = rawData.values();
      } else {
        responseArray = [
          ...rawData.values(),
          ...surveyResultsAppData.rawData.trials.slice(rawData.values().length),
        ];
      }
    } else {
      responseArray = rawData.values();
    }
    setSurveyResult({
      rawData: { trials: responseArray as ResponseElement[] },
      settings,
    });
  };

  useEffect(() => {
    if (status === 'success' && !surveyResultsAppData) {
      setSurveyResult({
        rawData: { trials: [] },
        settings: { fullScreenSettings, nextStepSettings, surveySettings },
      });
    }
    if (!jsPsychRef.current && surveyResultsAppData) {
      jsPsychRef.current = run({
        input: {
          appSettings: {
            fullScreenSettings,
            nextStepSettings,
            surveySettings,
          },
          experimentResult: surveyResultsAppData,
        },
        onFinish,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, surveyResultsAppData]);

  return (
    <div className="jspsych-content-outer-wrapper">
      <div id="jspsych-content" className="jspsych-content-outer" />
    </div>
  );
};

export default SurveyLoader;
