import type { Preview } from '@storybook/react'
import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport';

import '../app/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    layout: 'centered',
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      // defaultViewport: 'iphone5',
    },
  },

};

export default preview;