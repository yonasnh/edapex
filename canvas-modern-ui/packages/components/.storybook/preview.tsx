import type { Preview } from '@storybook/react'
import '@schoolapex/core/dist/config/design-tokens.css'
import '@schoolapex/core/dist/config/component-tokens.css'
import '../dist/index.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F7F8FA' },
        { name: 'dark', value: '#111315' },
      ],
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'button-name', enabled: true },
          { id: 'label', enabled: true },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Light or dark theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehue',
        items: [
          { value: 'light', icon: 'circlehue', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme || 'light'
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.className = `${theme}-theme`

      return (
        <div style={{ padding: '16px', fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
