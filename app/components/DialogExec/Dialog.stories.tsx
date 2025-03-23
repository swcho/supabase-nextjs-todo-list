import type { Meta, StoryObj } from '@storybook/react';
import Dialog from './Dialog';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  // tags: ['autodocs'],
  argTypes: {
    // onToggle: { action: 'toggled' },
    // onDelete: { action: 'deleted' },
  },
  decorators: [
    (Story) => (
      <div className="w-96 border rounded-md">
        <ul>
          <Story />
        </ul>
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    severity: 'error',
    open: true,
    title: 'Complete Storybook setup',
    description: 'This is a very long todo item that should demonstrate how the component handles text overflow and truncation in the UI',
    onCancel: () => {},
    onConfirm: () => {},
  },
};