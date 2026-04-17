import type { Meta, StoryObj } from '@storybook/react';
import LoginForm from '../Components/Login/Login';

const meta = {
	title: 'Login/Login',
	component: LoginForm,
	tags: ['autodocs'],
	parameters: {
		// More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'centered',
	},

} satisfies Meta<typeof LoginForm>;
  
export default meta;
type Story = StoryObj<typeof meta>;

export const LogsIn: Story = {
};

