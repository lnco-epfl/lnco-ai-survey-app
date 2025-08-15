import { FC } from 'react';
import { useTranslation } from 'react-i18next';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'react-quill/dist/quill.snow.css';

import { TextField, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';

// eslint-disable-next-line import/no-extraneous-dependencies
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@mdxeditor/editor/style.css';

// Import Quill styles
import { TextElement } from '@/modules/config/AppSettings';

type TextElementSettingsViewProps = {
  textElement: TextElement;
  onChange: (element: TextElement) => void;
};

const TextElementSettingsView: FC<TextElementSettingsViewProps> = ({
  textElement,
  onChange,
}) => {
  const { t } = useTranslation('translations', {
    keyPrefix: 'SETTINGS.SECTIONS',
  });
  const { title, description } = textElement;

  return (
    <Stack spacing={2}>
      <TextField
        value={title}
        label={t('TITLE_LABEL')} // Assuming you want to use the same label here
        onChange={(e) => onChange({ ...textElement, title: e.target.value })}
      />
      <Stack spacing={2}>
        <Typography variant="body2" component="label" color="textSecondary">
          {t('DESCRIPTION_LABEL')}
        </Typography>
        <MDXEditor
          markdown={description}
          onChange={(value) => onChange({ ...textElement, description: value })}
          plugins={[
            headingsPlugin(),
            toolbarPlugin({
              toolbarClassName: 'my-classname',
              // eslint-disable-next-line react/no-unstable-nested-components
              toolbarContents: () => (
                <>
                  {' '}
                  <BlockTypeSelect />
                  <UndoRedo />
                  <BoldItalicUnderlineToggles />
                  <ListsToggle />
                </>
              ),
            }),
            listsPlugin(),
          ]}
        />
      </Stack>
    </Stack>
  );
};

export default TextElementSettingsView;
