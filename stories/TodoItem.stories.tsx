import type { Meta, StoryObj } from '@storybook/react';
import TodoItem from '@/app/teams/[teamUrlKey]/_components/TodoItem';
import { Todo } from '@/lib/rpc/todo';

const sampleTodo: Todo = {
  id: 1,
  user_id: 'user123',
  todo: 'Complete Storybook setup',
  is_completed: false,
  created_at: new Date().toISOString(),
  team_id: 1
};

const meta = {
  title: 'Components/TodoItem',
  component: TodoItem,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onToggle: { action: 'toggled' },
    onDelete: { action: 'deleted' },
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
} satisfies Meta<typeof TodoItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Incomplete: Story = {
  args: {
    todo: sampleTodo,
  },
};

export const Completed: Story = {
  args: {
    todo: {
      ...sampleTodo,
      is_completed: true,
    },
  },
};

export const LongText: Story = {
  args: {
    todo: {
      ...sampleTodo,
      todo: 'This is a very long todo item that should demonstrate how the component handles text overflow and truncation in the UI',
    },
  },
};